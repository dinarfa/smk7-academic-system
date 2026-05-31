<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\ManualAttendanceRequest;
use App\Http\Requests\Teacher\OpenAttendanceSessionRequest;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\SubjectSchedule;
use App\Services\Attendance\AttendanceSessionLifecycleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AttendanceSessionController extends Controller
{
    /**
     * Open a new QR attendance session, auto-detecting type and subject from timetable.
     */
    public function store(
        OpenAttendanceSessionRequest $request,
        AttendanceSessionLifecycleService $attendanceSessionLifecycleService,
    ): RedirectResponse {
        $teacher = $request->user();
        $validated = $request->validated();
        $classId = (int) $validated['class_id'];

        $schedule = SubjectSchedule::resolveForClassNow($classId);

        if (! $schedule) {
            throw ValidationException::withMessages([
                'class_id' => __('Sesi absensi hanya bisa dibuka saat jadwal kelas sedang aktif.'),
            ]);
        }

        // Security: for subject-type slots, verify the teacher is assigned via pivot
        if ($schedule->schedule_type === 'subject' && $schedule->subject_id !== null) {
            $pivotTeacherId = $schedule->subject->schoolClasses()
                ->where('school_classes.id', $classId)
                ->first()?->pivot?->teacher_id;

            $teacherOwnsSubject = $pivotTeacherId === $teacher->id;

            if (! $teacherOwnsSubject) {
                $teacherSubjectIds = $teacher->teachingSubjects()
                    ->wherePivot('school_class_id', $classId)
                    ->pluck('subjects.id');

                $teacherSchedule = SubjectSchedule::query()
                    ->where('school_class_id', $classId)
                    ->whereIn('subject_id', $teacherSubjectIds)
                    ->activeNow()
                    ->first();

                if ($teacherSchedule) {
                    $schedule = $teacherSchedule;
                } else {
                    throw ValidationException::withMessages([
                        'class_id' => __('Anda tidak memiliki mata pelajaran yang aktif saat ini di kelas ini.'),
                    ]);
                }
            }
        }

        $endsAt = now()->setTimeFromTimeString($schedule->ends_at);
        $minutesUntilEnd = now()->diffInMinutes($endsAt, false);

        $sessionData = [
            'class_id' => $schedule->school_class_id,
            'type' => $schedule->resolveQrType()->value,
            'subject_id' => $schedule->subject_id,
            'subject' => $schedule->subject?->name,
            'duration_minutes' => $minutesUntilEnd > 0 ? max(5, $minutesUntilEnd) : 30,
        ];

        $attendanceSessionLifecycleService->open($teacher->id, $sessionData);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('QR absensi berhasil dibuka.')]);

        return back();
    }

    /**
     * Close an active attendance session.
     */
    public function close(
        AttendanceSession $attendanceSession,
        AttendanceSessionLifecycleService $attendanceSessionLifecycleService,
    ): RedirectResponse {
        Gate::authorize('close', $attendanceSession);

        $attendanceSessionLifecycleService->close($attendanceSession);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Sesi QR ditutup.')]);

        return back();
    }

    /**
     * Rotate the QR token for an active attendance session.
     */
    public function rotateQr(
        AttendanceSession $attendanceSession,
        AttendanceSessionLifecycleService $attendanceSessionLifecycleService,
    ): JsonResponse {
        Gate::authorize('close', $attendanceSession);

        if (! $attendanceSession->is_active) {
            return response()->json(['message' => 'Sesi tidak aktif.'], 422);
        }

        $attendanceSessionLifecycleService->rotateToken($attendanceSession);

        $attendanceSession->refresh();

        return response()->json([
            'qr_payload' => $attendanceSession->qrPayload(),
            'qr_svg' => $attendanceSession->qrSvg(),
            'qr_expires_at' => $attendanceSession->qr_expires_at?->toIso8601String(),
        ]);
    }

    /**
     * Store manual attendance records.
     */
    public function storeManual(
        ManualAttendanceRequest $request,
        AttendanceSessionLifecycleService $lifecycleService,
    ): RedirectResponse {
        $teacher = $request->user();
        $validated = $request->validated();
        $classId = (int) $validated['class_id'];

        // Resolve schedule (same logic as QR store)
        $schedule = SubjectSchedule::resolveForClassNow($classId);

        if (! $schedule) {
            throw ValidationException::withMessages([
                'class_id' => __('Sesi absensi hanya bisa dibuka saat jadwal kelas sedang aktif.'),
            ]);
        }

        // Security: verify teacher owns the subject via pivot
        if ($schedule->schedule_type === 'subject' && $schedule->subject_id !== null) {
            $pivotTeacherId = $schedule->subject->schoolClasses()
                ->where('school_classes.id', $classId)
                ->first()?->pivot?->teacher_id;

            $teacherOwnsSubject = $pivotTeacherId === $teacher->id;

            if (! $teacherOwnsSubject) {
                $teacherSubjectIds = $teacher->teachingSubjects()
                    ->wherePivot('school_class_id', $classId)
                    ->pluck('subjects.id');

                $teacherSchedule = SubjectSchedule::query()
                    ->where('school_class_id', $classId)
                    ->whereIn('subject_id', $teacherSubjectIds)
                    ->activeNow()
                    ->first();

                if ($teacherSchedule) {
                    $schedule = $teacherSchedule;
                } else {
                    throw ValidationException::withMessages([
                        'class_id' => __('Anda tidak memiliki mata pelajaran yang aktif saat ini di kelas ini.'),
                    ]);
                }
            }
        }

        // Create session with schedule data (same as QR)
        $endsAt = now()->setTimeFromTimeString($schedule->ends_at);
        $minutesUntilEnd = now()->diffInMinutes($endsAt, false);

        $session = $lifecycleService->open($teacher->id, [
            'class_id' => $schedule->school_class_id,
            'type' => $schedule->resolveQrType()->value,
            'subject_id' => $schedule->subject_id,
            'subject' => $schedule->subject?->name,
            'duration_minutes' => $minutesUntilEnd > 0 ? max(5, $minutesUntilEnd) : 30,
        ]);

        // Save attendance records
        $count = 0;
        foreach ($validated['students'] as $student) {
            AttendanceRecord::updateOrCreate(
                [
                    'attendance_session_id' => $session->id,
                    'student_id' => $student['student_id'],
                ],
                [
                    'status' => $student['status'],
                    'phase' => $schedule->resolveQrType()->toRecordPhase()->value,
                    'source' => 'manual',
                    'scanned_at' => now(),
                ],
            );
            $count++;
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Presensi manual berhasil disimpan untuk :count siswa.', ['count' => $count]),
        ]);

        return back();
    }
}
