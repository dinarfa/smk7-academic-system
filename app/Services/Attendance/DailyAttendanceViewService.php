<?php

namespace App\Services\Attendance;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use Carbon\Carbon;

class DailyAttendanceViewService
{
    /**
     * Get daily attendance records grouped by phase, with subject info.
     *
     * @param  string  $date  Date in Y-m-d format
     * @param  int  $teacherId  Teacher ID to filter sessions
     */
    public function getByDate(string $date, int $teacherId): array
    {
        $startOfDay = Carbon::parse($date)->startOfDay();
        $endOfDay = Carbon::parse($date)->endOfDay();

        $sessions = AttendanceSession::where('opened_by', $teacherId)
            ->whereBetween('starts_at', [$startOfDay, $endOfDay])
            ->pluck('id');

        if ($sessions->isEmpty()) {
            return [];
        }

        $records = AttendanceRecord::with(['student', 'session', 'session.subjectModel'])
            ->whereIn('attendance_session_id', $sessions)
            ->orderBy('student_id')
            ->orderBy('scanned_at')
            ->get()
            ->groupBy('phase');

        return $records->toArray();
    }

    /**
     * Get attendance recap grouped by date, then by subject.
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

        $records = AttendanceRecord::with(['student', 'session', 'session.subjectModel'])
            ->whereIn('attendance_session_id', $sessions)
            ->orderBy('student_id')
            ->orderBy('scanned_at')
            ->get()
            ->groupBy(fn ($r) => $r->scanned_at->format('Y-m-d'));

        // Nested group: date -> subject_name -> records
        $grouped = [];
        foreach ($records as $date => $dayRecords) {
            $bySubject = $dayRecords->groupBy(function ($r) {
                return $r->session?->subject_name ?? 'Umum';
            });
            $grouped[$date] = $bySubject->toArray();
        }

        return $grouped;
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
