<?php

namespace App\Services\Attendance;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use Carbon\Carbon;

class DailyAttendanceViewService
{
    /**
     * Get daily attendance records grouped by phase.
     *
     * @param  string  $date  Date in Y-m-d format
     * @param  int  $teacherId  Teacher ID to filter sessions
     */
    public function getByDate(string $date, int $teacherId): array
    {
        $startOfDay = Carbon::parse($date)->startOfDay();
        $endOfDay = Carbon::parse($date)->endOfDay();

        // Get all sessions for this teacher on this date
        $sessions = AttendanceSession::where('opened_by', $teacherId)
            ->whereBetween('starts_at', [$startOfDay, $endOfDay])
            ->pluck('id');

        if ($sessions->isEmpty()) {
            return [];
        }

        // Get attendance records grouped by phase
        $records = AttendanceRecord::with(['student', 'session'])
            ->whereIn('attendance_session_id', $sessions)
            ->orderBy('student_id')
            ->orderBy('scanned_at')
            ->get()
            ->groupBy('phase');

        return $records->toArray();
    }

    /**
     * Get attendance recap grouped by date for a date range.
     *
     * @param  string  $startDate  Date in Y-m-d format
     * @param  string  $endDate  Date in Y-m-d format
     * @param  int  $teacherId  Teacher ID to filter sessions
     */
    public function getRecap(string $startDate, string $endDate, int $teacherId): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $sessions = AttendanceSession::where('opened_by', $teacherId)
            ->whereBetween('starts_at', [$start, $end])
            ->pluck('id');

        if ($sessions->isEmpty()) {
            return [];
        }

        $records = AttendanceRecord::with(['student', 'session'])
            ->whereIn('attendance_session_id', $sessions)
            ->orderBy('student_id')
            ->orderBy('scanned_at')
            ->get()
            ->groupBy(fn ($r) => $r->scanned_at->format('Y-m-d'));

        return $records->toArray();
    }

    /**
     * Get active session for teacher (if any).
     */
    public function getActiveSession(int $teacherId): ?AttendanceSession
    {
        return AttendanceSession::where('opened_by', $teacherId)
            ->where('is_active', true)
            ->where('ends_at', '>', now())
            ->first();
    }
}
