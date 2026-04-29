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
        $this->closeActiveSessions($teacherId, $validated['type']);

        return AttendanceSession::query()->create([
            'opened_by' => $teacherId,
            'type' => $validated['type'],
            'subject' => $validated['subject'] ?? null,
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
     * Close active sessions for the given teacher and type.
     */
    public function closeActiveSessions(int $teacherId, string $type): Collection
    {
        $activeSessions = AttendanceSession::query()
            ->where('opened_by', $teacherId)
            ->where('is_active', true)
            ->where('type', $type)
            ->get();

        $activeSessions->each(function (AttendanceSession $attendanceSession): void {
            $this->close($attendanceSession);
        });

        return $activeSessions;
    }
}
