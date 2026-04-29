<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReportController extends Controller
{
    /**
     * Display global attendance overview.
     */
    public function overview(Request $request): Response
    {
        $totalUsers = User::count();
        $totalTeachers = User::where('role', 'teacher')->count();
        $totalStudents = User::where('role', 'student')->count();
        $totalSessions = AttendanceSession::count();
        $totalRecords = AttendanceRecord::count();
        $todayRecords = AttendanceRecord::whereDate('scanned_at', now()->toDateString())->count();

        // Get top attendance by student
        $topStudents = AttendanceRecord::query()
            ->select('student_id')
            ->selectRaw('COUNT(*) as attendance_count')
            ->with('student:id,name,email')
            ->groupBy('student_id')
            ->orderByRaw('COUNT(*) DESC')
            ->take(10)
            ->get();

        // Get recent sessions
        $recentSessions = AttendanceSession::query()
            ->with('openedBy:id,name')
            ->latest('created_at')
            ->take(10)
            ->get();

        return Inertia::render('admin/reports/overview', [
            'summary' => [
                'total_users' => $totalUsers,
                'total_teachers' => $totalTeachers,
                'total_students' => $totalStudents,
                'total_sessions' => $totalSessions,
                'total_records' => $totalRecords,
                'today_records' => $todayRecords,
            ],
            'topStudents' => $topStudents->map(fn (AttendanceRecord $record): array => [
                'student_id' => $record->student_id,
                'student_name' => $record->student->name,
                'student_email' => $record->student->email,
                'attendance_count' => $record->attendance_count,
            ])->values(),
            'recentSessions' => $recentSessions->map(fn (AttendanceSession $session): array => [
                'id' => $session->id,
                'type' => $session->type,
                'subject' => $session->subject,
                'opened_by' => $session->openedBy->name,
                'created_at' => $session->created_at?->toIso8601String(),
                'is_active' => $session->is_active,
            ])->values(),
        ]);
    }

    /**
     * Display attendance records by class/session.
     */
    public function bySession(Request $request): Response
    {
        $query = AttendanceSession::query()
            ->with(['records' => function ($q) {
                $q->with('student:id,name,email');
            }, 'openedBy:id,name'])
            ->withCount('records');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('subject', 'like', "%{$search}%")
                ->orWhere('type', 'like', "%{$search}%");
        }

        $sessions = $query->paginate(10);

        return Inertia::render('admin/reports/by-session', [
            'sessions' => $sessions->through(fn (AttendanceSession $session): array => [
                'id' => $session->id,
                'type' => $session->type,
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
                    'status' => $record->status,
                    'scanned_at' => $record->scanned_at?->toIso8601String(),
                ])->values(),
            ])->values(),
        ]);
    }

    /**
     * Display attendance records by student.
     */
    public function byStudent(Request $request): Response
    {
        $students = User::query()
            ->where('role', 'student')
            ->with(['attendanceRecords' => function ($q) {
                $q->with('session:id,type,subject,opened_by')
                    ->latest('scanned_at');
            }])
            ->withCount('attendanceRecords')
            ->paginate(10);

        return Inertia::render('admin/reports/by-student', [
            'students' => $students->through(fn (User $student): array => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'records_count' => $student->attendance_records_count,
                'records' => $student->attendanceRecords->map(fn (AttendanceRecord $record): array => [
                    'id' => $record->id,
                    'session_type' => $record->session->type,
                    'session_subject' => $record->session->subject,
                    'status' => $record->status,
                    'scanned_at' => $record->scanned_at?->toIso8601String(),
                ])->values(),
            ])->values(),
        ]);
    }

    /**
     * Export attendance data as CSV.
     */
    public function export(Request $request)
    {
        $records = AttendanceRecord::query()
            ->with(['student:id,name,email', 'session:id,type,subject'])
            ->get();

        $csv = "Student Name,Email,Session Type,Subject,Status,Scanned At\n";
        foreach ($records as $record) {
            $csv .= "\"{$record->student->name}\",\"{$record->student->email}\",\"{$record->session->type}\",\"{$record->session->subject}\",\"{$record->status}\",\"{$record->scanned_at}\"\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="attendance-export-'.now()->format('Y-m-d-His').'.csv"');
    }
}
