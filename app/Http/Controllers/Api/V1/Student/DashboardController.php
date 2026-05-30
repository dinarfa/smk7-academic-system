<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get student dashboard summary.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalAttendance = AttendanceRecord::where('student_id', $user->id)->count();
        $todayAttendance = AttendanceRecord::where('student_id', $user->id)
            ->whereDate('scanned_at', now()->toDateString())
            ->count();

        $recentRecords = AttendanceRecord::query()
            ->where('student_id', $user->id)
            ->with('session:id,type,subject,starts_at,ends_at')
            ->latest('scanned_at')
            ->take(10)
            ->get()
            ->map(fn (AttendanceRecord $record) => [
                'id' => $record->id,
                'session_type' => $record->session?->type,
                'subject' => $record->session?->subject,
                'scanned_at' => $record->scanned_at?->toIso8601String(),
                'status' => $record->status,
            ]);

        return response()->json([
            'data' => [
                'summary' => [
                    'total_attendance' => $totalAttendance,
                    'today_attendance' => $todayAttendance,
                ],
                'recent_records' => $recentRecords,
            ],
        ]);
    }
}
