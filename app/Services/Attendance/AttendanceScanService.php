<?php

namespace App\Services\Attendance;

use App\Enums\AttendanceStatus;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\User;

class AttendanceScanService
{
    private const PHASE_MAP = [
        'morning' => 'morning',
        'subject' => 'class',
        'dismissal' => 'dismissal',
    ];

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
        $record = AttendanceRecord::query()->firstOrNew([
            'attendance_session_id' => $session->id,
            'student_id' => $student->id,
        ]);

        if (! $record->exists) {
            $record->fill([
                'status' => AttendanceStatus::Present->value,
                'scanned_at' => now(),
                'phase' => $this->attendancePhase($session),
                'source' => 'qr_scan',
            ]);
            $record->save();

            return $record;
        }

        if ($record->status === AttendanceStatus::Bolos) {
            $record->status = AttendanceStatus::Present;
            $record->scanned_at = now();
            $record->phase = $this->attendancePhase($session);
            $record->source = 'qr_scan';
            $record->save();
        }

        return $record;
    }

    private function attendancePhase(AttendanceSession $session): string
    {
        return self::PHASE_MAP[$session->type->value] ?? $session->type->value;
    }
}
