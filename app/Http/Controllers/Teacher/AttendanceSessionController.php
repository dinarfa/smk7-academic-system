<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\OpenAttendanceSessionRequest;
use App\Models\AttendanceSession;
use App\Services\Attendance\AttendanceSessionLifecycleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AttendanceSessionController extends Controller
{
    /**
     * Open a new QR attendance session.
     */
    public function store(
        OpenAttendanceSessionRequest $request,
        AttendanceSessionLifecycleService $attendanceSessionLifecycleService,
    ): RedirectResponse {
        $validated = $request->validated();

        $attendanceSessionLifecycleService->open($request->user()->id, $validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('QR absensi berhasil dibuka.')]);

        return back();
    }

    /**
     * Close an active attendance session.
     */
    public function close(
        AttendanceSession $attendanceSession,
        AttendanceSessionLifecycleService $attendanceSessionLifecycleService,
    ): RedirectResponse {
        Gate::authorize('close', $attendanceSession);

        $attendanceSessionLifecycleService->close($attendanceSession);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Sesi QR ditutup.')]);

        return back();
    }
}
