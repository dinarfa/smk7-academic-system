<?php

namespace App\Services\Attendance;

use App\Enums\AttendanceQrType;
use App\Enums\AttendanceStatus;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\SubjectSchedule;
use App\Models\User;

class AttendanceScanService
{
    /**
     * Resolve a QR token from a raw scanned payload.
     */
    public function extractToken(string $rawToken): string
    {
        if (str_starts_with($rawToken, 'attendance:')) {
            return str($rawToken)->after('attendance:')->toString();
        }

        if (str_contains($rawToken, '?')) {
            $query = parse_url($rawToken, PHP_URL_QUERY);

            if ($query) {
                parse_str($query, $params);

                if (! empty($params['token']) && is_string($params['token'])) {
                    return $params['token'];
                }
            }
        }

        return $rawToken;
    }

    /**
     * Resolve an active attendance session by QR token.
     */
    public function findActiveSessionByToken(string $token): ?AttendanceSession
    {
        return AttendanceSession::query()
            ->where('qr_token', $token)
            ->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where(function ($query): void {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->first();
    }

    /**
     * Check if the student belongs to the homeroom class of the teacher who opened the session.
     */
    public function isStudentAllowed(User $student, AttendanceSession $session): bool
    {
        // If student not assigned to class (legacy/test setups), allow scan.
        if (! $student->school_class_id) {
            return true;
        }

        return $student->schoolClass
            && $student->schoolClass->homeroom_teacher_id === $session->opened_by;
    }

    /**
     * Determine attendance status based on scan time vs session start + grace period.
     */
    public function resolveStatus(AttendanceSession $session): AttendanceStatus
    {
        $graceMinutes = (int) config('attendance.grace_period_minutes', 10);
        $lateThreshold = $session->starts_at->addMinutes($graceMinutes);

        return now()->isAfter($lateThreshold)
            ? AttendanceStatus::Late
            : AttendanceStatus::Present;
    }

    /**
     * Record attendance for the given student and session.
     */
    public function record(User $student, AttendanceSession $session): AttendanceRecord
    {
        $record = AttendanceRecord::query()->firstOrNew([
            'attendance_session_id' => $session->id,
            'student_id' => $student->id,
        ]);

        if (! $record->exists) {
            $record->fill([
                'status' => $this->resolveStatus($session)->value,
                'scanned_at' => now(),
                'phase' => $this->attendancePhase($student)->toRecordPhase()->value,
                'source' => 'qr_scan',
            ]);
            $record->save();

            return $record;
        }

        if ($record->status === AttendanceStatus::Bolos || $record->status === AttendanceStatus::Absent) {
            $record->status = $this->resolveStatus($session);
            $record->scanned_at = now();
            $record->phase = $this->attendancePhase($student)->toRecordPhase()->value;
            $record->source = 'qr_scan';
            $record->save();
        }

        return $record;
    }

    /**
     * Derive the attendance phase from the actual scan time against the class timetable.
     *
     * 1. Check if an active slot exists right now → use its type.
     * 2. Otherwise, find the closest slot for the day → use its type (scan is late/early).
     * 3. If no schedule exists at all → fall back to 'morning'.
     */
    private function attendancePhase(User $student): AttendanceQrType
    {
        $classId = $student->school_class_id;

        if (! $classId) {
            return AttendanceQrType::Morning;
        }

        // 1. Active slot right now
        $active = SubjectSchedule::query()
            ->where('school_class_id', $classId)
            ->activeNow()
            ->first();

        if ($active) {
            return $active->resolveQrType();
        }

        // 2. Closest slot for today
        $closest = SubjectSchedule::findClosestSlot($classId);

        if ($closest) {
            return $closest->resolveQrType();
        }

        // 3. No schedule at all — default
        return AttendanceQrType::Morning;
    }
}
