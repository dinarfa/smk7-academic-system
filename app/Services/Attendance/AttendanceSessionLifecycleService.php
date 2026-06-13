<?php

namespace App\Services\Attendance;

use App\Models\AttendanceSession;
use Illuminate\Support\Collection;

class AttendanceSessionLifecycleService
{
    /**
     * Close the current teacher's active sessions for the same type and open a new one.
     */
    public function open(int $teacherId, array $validated): AttendanceSession
    {
        $this->closeActiveSessions($teacherId, $validated['type'], $validated['class_id'] ?? null);

        return AttendanceSession::query()->create([
            'opened_by' => $teacherId,
            'class_id' => $validated['class_id'] ?? null,
            'type' => $validated['type'],
            'subject' => $validated['subject'] ?? null,
            'subject_id' => $validated['subject_id'] ?? null,
            'qr_token' => (string) str()->ulid(),
            'starts_at' => now(),
            'ends_at' => now()->addMinutes((int) ($validated['duration_minutes'] ?? 30)),
            'is_active' => true,
        ]);
    }

    /**
     * Close an attendance session.
     */
    public function close(AttendanceSession $attendanceSession): AttendanceSession
    {
        $attendanceSession->update([
            'is_active' => false,
            'ends_at' => now(),
        ]);

        return $attendanceSession;
    }

    /**
     * Rotate the QR token for an active session.
     *
     * Returns the new token string. The token is valid for 30 seconds.
     */
    public function rotateToken(AttendanceSession $session): string
    {
        $newToken = (string) str()->ulid();
        $expiresAt = now()->addSeconds(30);

        $session->update([
            'qr_token' => $newToken,
            'qr_expires_at' => $expiresAt,
        ]);

        return $newToken;
    }

    /**
     * Close all active sessions that have already expired.
     *
     * After closing, automatically detects bolos for the closed sessions.
     */
    public function closeExpiredSessions(): int
    {
        $expiredSessions = AttendanceSession::query()
            ->where('is_active', true)
            ->whereNotNull('ends_at')
            ->where('ends_at', '<=', now())
            ->get();

        $count = $expiredSessions->count();

        if ($count > 0) {
            AttendanceSession::query()
                ->whereIn('id', $expiredSessions->pluck('id'))
                ->update([
                    'is_active' => false,
                    'ends_at' => now(),
                ]);

            // Auto-detect bolos for closed sessions
            app(AbsenceDetectionService::class)->detectForSessions($expiredSessions);
        }

        return $count;
    }

    /**
     * Close active sessions for the given teacher and type.
     */
    public function closeActiveSessions(int $teacherId, string $type, ?int $classId = null): Collection
    {
        $query = AttendanceSession::query()
            ->where('opened_by', $teacherId)
            ->where('is_active', true)
            ->where('type', $type);

        if ($classId) {
            $query->where('class_id', $classId);
        }

        $activeSessions = $query->get();

        $activeSessions->each(function (AttendanceSession $attendanceSession): void {
            $this->close($attendanceSession);
        });

        return $activeSessions;
    }
}
