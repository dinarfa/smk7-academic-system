<?php

namespace App\Services\Attendance;

use App\Enums\AttendanceStatus;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
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
     * Record attendance for the given student and session.
     */
    public function record(User $student, AttendanceSession $session): AttendanceRecord
    {
        return AttendanceRecord::query()->firstOrCreate(
            [
                'attendance_session_id' => $session->id,
                'student_id' => $student->id,
            ],
            [
                'status' => AttendanceStatus::Present->value,
                'scanned_at' => now(),
            ],
        );
    }
}
