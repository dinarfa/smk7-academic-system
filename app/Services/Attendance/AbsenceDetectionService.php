<?php

namespace App\Services\Attendance;

use App\Enums\AttendanceStatus;
use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\SchoolClass;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AbsenceDetectionService
{
    private const PHASE_MAP = [
        'morning' => 'morning',
        'subject' => 'class',
        'dismissal' => 'dismissal',
    ];

    /**
     * Detect and persist missing attendance records for all teachers on a date.
     *
     * @return array<string, mixed>
     */
    public function detectForDate(string $date): array
    {
        $normalizedDate = Carbon::parse($date)->format('Y-m-d');

        $teachers = User::query()
            ->where('role', UserRole::Teacher)
            ->with(['homeroomClasses.students'])
            ->get();

        $reports = [];
        $totalCreated = 0;

        foreach ($teachers as $teacher) {
            $report = $this->detectForTeacherOnDate($teacher->id, $normalizedDate);
            $reports[] = $report;
            $totalCreated += $report['created'];
        }

        return [
            'date' => $normalizedDate,
            'teachers' => $reports,
            'created' => $totalCreated,
        ];
    }

    /**
     * Detect and persist missing attendance records for specific closed sessions.
     *
     * More efficient than detectForDate() — only processes the given sessions
     * instead of scanning all sessions for the day.
     *
     * @return int Number of bolos records created
     */
    public function detectForSessions(Collection $sessions): int
    {
        if ($sessions->isEmpty()) {
            return 0;
        }

        $teacherIds = $sessions->pluck('opened_by')->unique();
        $sessionIds = $sessions->pluck('id');

        $teachers = User::query()
            ->whereIn('id', $teacherIds)
            ->with(['homeroomClasses.students'])
            ->get();

        // Eager-load session relationships for class resolution
        foreach ($sessions as $session) {
            $session->loadMissing(['subjectModel.schoolClasses.students']);
        }

        $totalCreated = 0;

        foreach ($teachers as $teacher) {
            // Homeroom students
            $homeroomStudentIds = $teacher->homeroomClasses
                ->flatMap(fn ($schoolClass) => $schoolClass->students)
                ->where('role', UserRole::Student)
                ->unique('id')
                ->pluck('id');

            $teacherSessions = $sessions->where('opened_by', $teacher->id);

            foreach ($teacherSessions as $session) {
                // Build student list: homeroom + session's target class
                $sessionStudentIds = collect($homeroomStudentIds->all());

                if ($session->class_id) {
                    $classStudentIds = SchoolClass::query()
                        ->where('id', $session->class_id)
                        ->with('students')
                        ->first()
                        ?->students()
                        ->where('role', UserRole::Student)
                        ->pluck('id') ?? collect();

                    $sessionStudentIds = $sessionStudentIds->merge($classStudentIds)->unique();
                } elseif ($session->subjectModel) {
                    $subjectClassStudentIds = $session->subjectModel->schoolClasses
                        ->flatMap(fn ($schoolClass) => $schoolClass->students)
                        ->where('role', UserRole::Student)
                        ->unique('id')
                        ->pluck('id');

                    $sessionStudentIds = $sessionStudentIds->merge($subjectClassStudentIds)->unique();
                }

                if ($sessionStudentIds->isEmpty()) {
                    continue;
                }

                $existingRecords = AttendanceRecord::query()
                    ->where('attendance_session_id', $session->id)
                    ->whereIn('student_id', $sessionStudentIds)
                    ->get()
                    ->keyBy(fn (AttendanceRecord $record): string => $record->student_id);

                $phase = self::PHASE_MAP[$session->type->value] ?? $session->type->value;

                foreach ($sessionStudentIds as $studentId) {
                    if (! $existingRecords->has($studentId)) {
                        AttendanceRecord::create([
                            'attendance_session_id' => $session->id,
                            'student_id' => $studentId,
                            'status' => AttendanceStatus::Bolos->value,
                            'phase' => $phase,
                            'scanned_at' => now(),
                            'source' => 'system',
                        ]);

                        $totalCreated++;
                    }
                }
            }
        }

        return $totalCreated;
    }

    /**
     * Detect and persist missing attendance records for a specific teacher on a date.
     *
     * @return array<string, mixed>
     */
    public function detectForTeacherOnDate(int $teacherId, string $date): array
    {
        $summary = $this->summaryForTeacherOnDate($teacherId, $date);

        $created = 0;

        foreach ($summary['missing'] as $missing) {
            AttendanceRecord::firstOrCreate([
                'attendance_session_id' => $missing['session_id'],
                'student_id' => $missing['student_id'],
            ], [
                'status' => AttendanceStatus::Bolos->value,
                'phase' => self::PHASE_MAP[$missing['session_type']] ?? $missing['session_type'],
                'scanned_at' => now(),
                'source' => 'system',
            ]);

            $created++;
        }

        return array_merge($summary, [
            'created' => $created,
        ]);
    }

    /**
     * Build a bolos summary for a teacher on a date.
     *
     * @return array<string, mixed>
     */
    public function summaryForTeacherOnDate(int $teacherId, string $date): array
    {
        $teacher = User::query()
            ->where('id', $teacherId)
            ->with(['homeroomClasses.students'])
            ->first();

        if (! $teacher) {
            return [
                'teacher_id' => $teacherId,
                'date' => $date,
                'expected_students' => 0,
                'sessions_count' => 0,
                'missing_count' => 0,
                'missing' => [],
            ];
        }

        $homeroomStudentCollection = $teacher->homeroomClasses
            ->flatMap(fn ($schoolClass) => $schoolClass->students)
            ->where('role', UserRole::Student)
            ->unique('id');

        $startOfDay = Carbon::parse($date)->startOfDay();
        $endOfDay = Carbon::parse($date)->endOfDay();

        $sessions = AttendanceSession::query()
            ->where('opened_by', $teacherId)
            ->whereBetween('starts_at', [$startOfDay, $endOfDay])
            ->get();

        if ($sessions->isEmpty()) {
            return [
                'teacher_id' => $teacherId,
                'date' => $date,
                'expected_students' => $homeroomStudentCollection->count(),
                'sessions_count' => 0,
                'missing_count' => 0,
                'missing' => [],
            ];
        }

        // Eager-load session relationships
        $sessions->loadMissing(['subjectModel.schoolClasses.students']);

        $allStudentIds = collect($homeroomStudentCollection->pluck('id')->all());
        $studentMap = $homeroomStudentCollection->keyBy('id');

        // Expand student map with session target class students
        foreach ($sessions as $session) {
            if ($session->class_id) {
                $classStudents = SchoolClass::query()
                    ->where('id', $session->class_id)
                    ->with('students')
                    ->first()
                    ?->students()
                    ->where('role', UserRole::Student)
                    ->get() ?? collect();

                foreach ($classStudents as $student) {
                    $allStudentIds->push($student->id);
                    $studentMap[$student->id] = $student;
                }
            } elseif ($session->subjectModel) {
                $subjectStudents = $session->subjectModel->schoolClasses
                    ->flatMap(fn ($schoolClass) => $schoolClass->students)
                    ->where('role', UserRole::Student);

                foreach ($subjectStudents as $student) {
                    $allStudentIds->push($student->id);
                    $studentMap[$student->id] = $student;
                }
            }
        }

        $allStudentIds = $allStudentIds->unique();

        if ($allStudentIds->isEmpty()) {
            return [
                'teacher_id' => $teacherId,
                'date' => $date,
                'expected_students' => 0,
                'sessions_count' => $sessions->count(),
                'missing_count' => 0,
                'missing' => [],
            ];
        }

        $attendanceRecords = AttendanceRecord::query()
            ->whereIn('attendance_session_id', $sessions->pluck('id'))
            ->whereIn('student_id', $allStudentIds)
            ->get()
            ->keyBy(fn (AttendanceRecord $record): string => $record->attendance_session_id.'-'.$record->student_id);

        $missing = [];

        foreach ($sessions as $session) {
            // Get students relevant to this session
            $sessionStudentIds = collect($homeroomStudentCollection->pluck('id')->all());

            if ($session->class_id) {
                $classStudentIds = SchoolClass::query()
                    ->where('id', $session->class_id)
                    ->with('students')
                    ->first()
                    ?->students()
                    ->where('role', UserRole::Student)
                    ->pluck('id') ?? collect();

                $sessionStudentIds = $sessionStudentIds->merge($classStudentIds)->unique();
            } elseif ($session->subjectModel) {
                $subjectClassStudentIds = $session->subjectModel->schoolClasses
                    ->flatMap(fn ($schoolClass) => $schoolClass->students)
                    ->where('role', UserRole::Student)
                    ->unique('id')
                    ->pluck('id');

                $sessionStudentIds = $sessionStudentIds->merge($subjectClassStudentIds)->unique();
            }

            foreach ($sessionStudentIds as $studentId) {
                $key = $session->id.'-'.$studentId;

                if (! $attendanceRecords->has($key)) {
                    $student = $studentMap->get($studentId);

                    $missing[] = [
                        'session_id' => $session->id,
                        'session_type' => $session->type->value,
                        'session_subject' => $session->subject,
                        'student_id' => $studentId,
                        'student_name' => $student?->name,
                    ];
                }
            }
        }

        return [
            'teacher_id' => $teacherId,
            'date' => $date,
            'expected_students' => $allStudentIds->count(),
            'sessions_count' => $sessions->count(),
            'missing_count' => count($missing),
            'missing' => $missing,
        ];
    }

    /**
     * Detect bolos for students who have no attendance records at all for the day.
     *
     * After the configured time, any student with zero attendance records for today
     * will be marked as bolos for each expected phase (morning, subject, dismissal).
     *
     * @return array{date: string, students_checked: int, records_created: int, details: array}
     */
    public function detectForSchedule(?string $date = null): array
    {
        $targetDate = $date ? Carbon::parse($date) : now();
        $dateString = $targetDate->format('Y-m-d');
        $startOfDay = $targetDate->copy()->startOfDay();
        $endOfDay = $targetDate->copy()->endOfDay();

        // Get all students
        $allStudents = User::query()
            ->where('role', UserRole::Student)
            ->whereNotNull('school_class_id')
            ->get();

        if ($allStudents->isEmpty()) {
            return [
                'date' => $dateString,
                'students_checked' => 0,
                'records_created' => 0,
                'details' => [],
            ];
        }

        // Get all attendance records for today, grouped by student_id
        $existingRecords = AttendanceRecord::query()
            ->whereBetween('scanned_at', [$startOfDay, $endOfDay])
            ->get()
            ->groupBy('student_id');

        // Find students with ZERO attendance records today
        $absentStudents = $allStudents->filter(fn ($student) => ! $existingRecords->has($student->id));

        if ($absentStudents->isEmpty()) {
            return [
                'date' => $dateString,
                'students_checked' => $allStudents->count(),
                'records_created' => 0,
                'details' => [],
            ];
        }

        // Group absent students by class
        $studentsByClass = $absentStudents->groupBy('school_class_id');

        // Create placeholder sessions for each class + phase combination
        $phases = ['morning', 'subject', 'dismissal'];
        $totalCreated = 0;
        $details = [];

        // Use first available user as system session opener
        $systemUserId = User::query()->first()?->id ?? 1;

        foreach ($studentsByClass as $classId => $students) {
            foreach ($phases as $sessionType) {
                // Find or create a placeholder session for this class + phase today
                $session = AttendanceSession::query()
                    ->where('class_id', $classId)
                    ->where('type', $sessionType)
                    ->whereBetween('starts_at', [$startOfDay, $endOfDay])
                    ->first();

                if (! $session) {
                    $session = AttendanceSession::query()->create([
                        'opened_by' => $systemUserId,
                        'class_id' => $classId,
                        'type' => $sessionType,
                        'subject' => null,
                        'subject_id' => null,
                        'starts_at' => $startOfDay,
                        'ends_at' => $endOfDay,
                        'is_active' => false,
                        'qr_token' => (string) str()->ulid(),
                    ]);
                }

                foreach ($students as $student) {
                    // Double-check no record exists for this student + session
                    $exists = AttendanceRecord::query()
                        ->where('attendance_session_id', $session->id)
                        ->where('student_id', $student->id)
                        ->exists();

                    if (! $exists) {
                        AttendanceRecord::create([
                            'attendance_session_id' => $session->id,
                            'student_id' => $student->id,
                            'status' => AttendanceStatus::Bolos->value,
                            'phase' => self::PHASE_MAP[$sessionType] ?? $sessionType,
                            'scanned_at' => now(),
                            'source' => 'system',
                        ]);

                        $totalCreated++;
                    }
                }
            }

            $className = SchoolClass::find($classId)?->name ?? 'Kelas #'.$classId;
            $details[] = [
                'class' => $className,
                'students_affected' => $students->count(),
            ];
        }

        return [
            'date' => $dateString,
            'students_checked' => $allStudents->count(),
            'records_created' => $totalCreated,
            'details' => $details,
        ];
    }
}
