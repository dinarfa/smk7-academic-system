<?php

namespace App\Services\Attendance;

use App\Enums\AttendanceStatus;
use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\User;
use Carbon\Carbon;

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
                'status' => AttendanceStatus::Absent->value,
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

        $studentCollection = $teacher->homeroomClasses
            ->flatMap(fn ($schoolClass) => $schoolClass->students)
            ->where('role', UserRole::Student)
            ->unique('id');

        $studentIds = $studentCollection->pluck('id');
        $studentMap = $studentCollection->keyBy('id');

        if ($studentIds->isEmpty()) {
            return [
                'teacher_id' => $teacherId,
                'date' => $date,
                'expected_students' => 0,
                'sessions_count' => 0,
                'missing_count' => 0,
                'missing' => [],
            ];
        }

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
                'expected_students' => $studentIds->count(),
                'sessions_count' => 0,
                'missing_count' => 0,
                'missing' => [],
            ];
        }

        $attendanceRecords = AttendanceRecord::query()
            ->whereIn('attendance_session_id', $sessions->pluck('id'))
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy(fn (AttendanceRecord $record): string => $record->attendance_session_id.'-'.$record->student_id);

        $missing = [];

        foreach ($sessions as $session) {
            foreach ($studentIds as $studentId) {
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
            'expected_students' => $studentIds->count(),
            'sessions_count' => $sessions->count(),
            'missing_count' => count($missing),
            'missing' => $missing,
        ];
    }
}
