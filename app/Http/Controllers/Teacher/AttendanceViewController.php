<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Services\Attendance\DailyAttendanceViewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class AttendanceViewController extends Controller
{
    /**
     * Get daily attendance data for teacher.
     */
    public function daily(DailyAttendanceViewService $service): JsonResponse
    {
        Gate::authorize('viewDaily', auth()->user());

        $date = request('date', today()->format('Y-m-d'));
        $attendance = $service->getByDate($date, auth()->id());
        $activeSession = $service->getActiveSession(auth()->id());

        return response()->json([
            'attendance' => $attendance,
            'active_session' => $activeSession,
            'date' => $date,
        ]);
    }
}
