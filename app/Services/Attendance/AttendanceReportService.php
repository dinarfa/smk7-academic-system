<?php

namespace App\Services\Attendance;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AttendanceReportService
{
    /**
     * Build the data for the admin attendance overview.
     *
     * @return array{
     *     summary: array{
     *         total_users: int,
     *         total_teachers: int,
     *         total_students: int,
     *         total_sessions: int,
     *         total_records: int,
     *         today_records: int,
     *     },
     *     topStudents: Collection<int, array<string, mixed>>,
     *     recentSessions: Collection<int, array<string, mixed>>
     * }
     */
    public function overview(): array
    {
        $totalUsers = User::count();
        $totalTeachers = User::where('role', 'teacher')->count();
        $totalStudents = User::where('role', 'student')->count();
        $totalSessions = AttendanceSession::count();
        $totalRecords = AttendanceRecord::count();
        $todayRecords = AttendanceRecord::whereDate('scanned_at', now()->toDateString())->count();

        $topStudents = AttendanceRecord::query()
            ->select('student_id')
            ->selectRaw('COUNT(*) as attendance_count')
            ->with('student:id,name,email')
            ->groupBy('student_id')
            ->orderByRaw('COUNT(*) DESC')
            ->take(10)
            ->get()
            ->map(fn (AttendanceRecord $record): array => [
                'student_id' => $record->student_id,
                'student_name' => $record->student->name,
                'student_email' => $record->student->email,
                'attendance_count' => $record->attendance_count,
            ])->values();

        $recentSessions = AttendanceSession::query()
            ->with('openedBy:id,name')
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(fn (AttendanceSession $session): array => [
                'id' => $session->id,
                'type' => $session->type?->value,
                'subject' => $session->subject,
                'opened_by' => $session->openedBy->name,
                'created_at' => $session->created_at?->toIso8601String(),
                'is_active' => $session->is_active,
            ])->values();

        return [
            'summary' => [
                'total_users' => $totalUsers,
                'total_teachers' => $totalTeachers,
                'total_students' => $totalStudents,
                'total_sessions' => $totalSessions,
                'total_records' => $totalRecords,
                'today_records' => $todayRecords,
            ],
            'topStudents' => $topStudents,
            'recentSessions' => $recentSessions,
        ];
    }

    /**
     * Build the paginated admin session report.
     *
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function sessions(?string $search = null): LengthAwarePaginator
    {
        $query = AttendanceSession::query()
            ->with(['records' => function ($q): void {
                $q->with('student:id,name,email');
            }, 'openedBy:id,name'])
            ->withCount('records');

        if ($search !== null && $search !== '') {
            $query->where(function ($innerQuery) use ($search): void {
                $innerQuery->where('subject', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $sessions = $query->paginate(10);

        $sessions->setCollection(
            $sessions->getCollection()->map(fn (AttendanceSession $session): array => [
                'id' => $session->id,
                'type' => $session->type?->value,
                'subject' => $session->subject,
                'opened_by' => $session->openedBy->name,
                'starts_at' => $session->starts_at?->toIso8601String(),
                'ends_at' => $session->ends_at?->toIso8601String(),
                'records_count' => $session->records_count,
                'is_active' => $session->is_active,
                'records' => $session->records->map(fn (AttendanceRecord $record): array => [
                    'id' => $record->id,
                    'student_name' => $record->student->name,
                    'student_email' => $record->student->email,
                    'status' => $record->status?->value,
                    'scanned_at' => $record->scanned_at?->toIso8601String(),
                ])->values(),
            ])->values(),
        );

        return $sessions;
    }

    /**
     * Build the paginated admin student report.
     *
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function students(): LengthAwarePaginator
    {
        $students = User::query()
            ->where('role', 'student')
            ->with(['attendanceRecords' => function ($q): void {
                $q->with('session:id,type,subject,opened_by')
                    ->latest('scanned_at');
            }])
            ->withCount('attendanceRecords')
            ->paginate(10);

        $students->setCollection(
            $students->getCollection()->map(fn (User $student): array => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'records_count' => $student->attendance_records_count,
                'records' => $student->attendanceRecords->map(fn (AttendanceRecord $record): array => [
                    'id' => $record->id,
                    'session_type' => $record->session->type?->value,
                    'session_subject' => $record->session->subject,
                    'status' => $record->status?->value,
                    'scanned_at' => $record->scanned_at?->toIso8601String(),
                ])->values(),
            ])->values(),
        );

        return $students;
    }

    /**
     * Build the CSV contents for attendance export.
     */
    public function exportCsv(): string
    {
        $records = AttendanceRecord::query()
            ->with(['student:id,name,email', 'session:id,type,subject'])
            ->get();

        $csv = "Student Name,Email,Session Type,Subject,Status,Scanned At\n";

        foreach ($records as $record) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s"%s',
                $record->student->name,
                $record->student->email,
                $record->session->type?->value,
                $record->session->subject,
                $record->status?->value,
                $record->scanned_at,
                "\n",
            );
        }

        return $csv;
    }
}
