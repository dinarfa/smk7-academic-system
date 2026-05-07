<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\ManualAttendanceRequest;
use App\Http\Requests\Teacher\OpenAttendanceSessionRequest;
use App\Models\AttendanceRecord;
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

    /**
     * Store manual attendance records.
     */
    public function storeManual(ManualAttendanceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $count = 0;
        foreach ($validated['students'] as $student) {
            AttendanceRecord::create([
                'attendance_session_id' => $validated['session_id'],
                'student_id' => $student['student_id'],
                'status' => $student['status'],
                'phase' => $validated['phase'],
                'source' => 'manual',
                'scanned_at' => now(),
            ]);
            $count++;
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Presensi manual berhasil disimpan untuk :count siswa.', ['count' => $count]),
        ]);

        return back();
    }
}
