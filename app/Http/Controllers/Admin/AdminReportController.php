<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Attendance\AttendanceReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReportController extends Controller
{
    /**
     * Display global attendance overview.
     */
    public function overview(AttendanceReportService $attendanceReportService): Response
    {
        $data = $attendanceReportService->overview();

        return Inertia::render('admin/reports/overview', [
            'summary' => $data['summary'],
            'topStudents' => $data['topStudents'],
            'recentSessions' => $data['recentSessions'],
        ]);
    }

    /**
     * Display attendance records by class/session.
     */
    public function bySession(Request $request, AttendanceReportService $attendanceReportService): Response
    {
        $sessions = $attendanceReportService->sessions($request->string('search')->toString());

        return Inertia::render('admin/reports/by-session', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Display attendance records by student.
     */
    public function byStudent(AttendanceReportService $attendanceReportService): Response
    {
        $students = $attendanceReportService->students();

        return Inertia::render('admin/reports/by-student', [
            'students' => $students,
        ]);
    }

    /**
     * Export attendance data as CSV.
     */
    public function export(AttendanceReportService $attendanceReportService)
    {
        $csv = $attendanceReportService->exportCsv();

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="attendance-export-'.now()->format('Y-m-d-His').'.csv"');
    }
}
