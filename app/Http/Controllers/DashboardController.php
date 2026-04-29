<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Render role-specific dashboard.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        if ($user->role === UserRole::Admin) {
            $totalUsers = User::count();
            $totalTeachers = User::where('role', UserRole::Teacher)->count();
            $totalStudents = User::where('role', UserRole::Student)->count();
            $totalSessions = AttendanceSession::count();
            $todayRecords = AttendanceRecord::whereDate('scanned_at', now()->toDateString())->count();

            return Inertia::render('admin/dashboard', [
                'summary' => [
                    'total_users' => $totalUsers,
                    'total_teachers' => $totalTeachers,
                    'total_students' => $totalStudents,
                    'total_sessions' => $totalSessions,
                    'today_records' => $todayRecords,
                ],
            ]);
        }

        if ($user->role === UserRole::Teacher) {
            $activeSessions = AttendanceSession::query()
                ->withCount('records')
                ->where('is_active', true)
                ->latest('starts_at')
                ->take(3)
                ->get();

            return Inertia::render('teacher/dashboard', [
                'summary' => [
                    'students_count' => User::query()->where('role', UserRole::Student)->count(),
                    'active_sessions_count' => AttendanceSession::query()->where('is_active', true)->count(),
                    'today_records_count' => AttendanceRecord::query()->whereDate('scanned_at', now()->toDateString())->count(),
                ],
                'activeSessions' => $activeSessions->map(fn (AttendanceSession $session): array => [
                    'id' => $session->id,
                    'type' => $session->type?->value,
                    'subject' => $session->subject,
                    'starts_at' => $session->starts_at?->toIso8601String(),
                    'ends_at' => $session->ends_at?->toIso8601String(),
                    'is_active' => $session->is_active,
                    'records_count' => $session->records_count,
                    'qr_payload' => $session->qrPayload(),
                    'qr_svg' => $session->qrSvg(),
                ])->values(),
                'recentRecords' => AttendanceRecord::query()
                    ->with(['student:id,name', 'session:id,type,subject'])
                    ->latest('scanned_at')
                    ->take(10)
                    ->get()
                    ->map(fn (AttendanceRecord $record): array => [
                        'id' => $record->id,
                        'student_name' => $record->student?->name,
                        'session_type' => $record->session?->type?->value,
                        'subject' => $record->session?->subject,
                        'scanned_at' => $record->scanned_at?->toIso8601String(),
                    ])->values(),
            ]);
        }

        $records = AttendanceRecord::query()
            ->where('student_id', $user->id)
            ->with('session:id,type,subject,starts_at,ends_at')
            ->latest('scanned_at')
            ->take(10)
            ->get();

        return Inertia::render('student/dashboard', [
            'summary' => [
                'total_attendance' => AttendanceRecord::query()->where('student_id', $user->id)->count(),
                'today_attendance' => AttendanceRecord::query()->where('student_id', $user->id)->whereDate('scanned_at', now()->toDateString())->count(),
            ],
            'recentRecords' => $records->map(fn (AttendanceRecord $record): array => [
                'id' => $record->id,
                'session_type' => $record->session?->type?->value,
                'subject' => $record->session?->subject,
                'scanned_at' => $record->scanned_at?->toIso8601String(),
            ])->values(),
        ]);
    }
}
