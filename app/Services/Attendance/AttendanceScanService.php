<?php

namespace App\Services\Attendance;

use App\Enums\AttendanceQrType;
use App\Enums\AttendanceStatus;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\SubjectSchedule;
use App\Models\User;
use Illuminate\Database\QueryException;

class AttendanceScanService
{
    /** @var array<int, AttendanceQrType> */
    private array $phaseCache = [];

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
     * Check if the student belongs to the class targeted by the session.
     */
    public function isStudentAllowed(User $student, AttendanceSession $session): bool
    {
        // If student not assigned to any class, reject scan.
        if (! $student->school_class_id) {
            return false;
        }

        $targetClassId = $session->resolvedClassId();

        if ($targetClassId) {
            return (int) $student->school_class_id === (int) $targetClassId;
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
        $phase = $this->attendancePhase($student)->toRecordPhase()->value;

        try {
            $record = AttendanceRecord::query()->firstOrCreate(
                [
                    'attendance_session_id' => $session->id,
                    'student_id' => $student->id,
                ],
                [
                    'status' => $this->resolveStatus($session)->value,
                    'scanned_at' => now(),
                    'phase' => $phase,
                    'source' => 'qr_scan',
                ],
            );
            $created = $record->wasRecentlyCreated;
        } catch (QueryException $e) {
            if ((int) $e->getCode() === 23000) {
                // Unique constraint violation — concurrent insert won the race
                $record = AttendanceRecord::where('attendance_session_id', $session->id)
                    ->where('student_id', $student->id)
                    ->first();
                $created = false;
            } else {
                throw $e;
            }
        }

        if (! $created && $record && ($record->status === AttendanceStatus::Bolos || $record->status === AttendanceStatus::Absent)) {
            $record->update([
                'status' => $this->resolveStatus($session)->value,
                'scanned_at' => now(),
                'phase' => $phase,
                'source' => 'qr_scan',
            ]);
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

        if (isset($this->phaseCache[$classId])) {
            return $this->phaseCache[$classId];
        }

        // 1. Active slot right now
        $active = SubjectSchedule::query()
            ->where('school_class_id', $classId)
            ->activeNow()
            ->first();

        if ($active) {
            return $this->phaseCache[$classId] = $active->resolveQrType();
        }

        // 2. Closest slot for today
        $closest = SubjectSchedule::findClosestSlot($classId);

        if ($closest) {
            return $this->phaseCache[$classId] = $closest->resolveQrType();
        }

        // 3. No schedule at all — default
        return $this->phaseCache[$classId] = AttendanceQrType::Morning;
    }
}
