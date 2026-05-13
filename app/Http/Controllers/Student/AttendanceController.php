<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\ScanAttendanceRequest;
use App\Models\AttendanceRecord;
use App\Services\Attendance\AttendanceScanService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Show the dedicated QR attendance scanner page.
     */
    public function scanPage(): Response
    {
        return Inertia::render('student/attendance/scan');
    }

    /**
     * Show attendance history for the authenticated student.
     */
    public function index(): Response
    {
        $student = request()->user();

        $records = AttendanceRecord::query()
            ->where('student_id', $student->id)
            ->with('session:id,type,subject,starts_at,ends_at')
            ->latest('scanned_at')
            ->paginate(15)
            ->through(fn (AttendanceRecord $record): array => [
                'id' => $record->id,
                'status' => $record->status,
                'scanned_at' => $record->scanned_at?->toIso8601String(),
                'session' => [
                    'type' => $record->session?->type,
                    'subject' => $record->session?->subject,
                    'starts_at' => $record->session?->starts_at?->toIso8601String(),
                    'ends_at' => $record->session?->ends_at?->toIso8601String(),
                ],
            ]);

        return Inertia::render('student/attendance', [
            'records' => $records,
        ]);
    }

    /**
     * Submit attendance from scanned QR token.
     */
    public function scan(
        ScanAttendanceRequest $request,
        AttendanceScanService $attendanceScanService,
    ): RedirectResponse {
        $rawToken = trim($request->validated('qr_token'));
        $token = $attendanceScanService->extractToken($rawToken);
        $session = $attendanceScanService->findActiveSessionByToken($token);

        if (! $session) {
            return back()->withErrors([
                'qr_token' => 'QR tidak valid atau sesi sudah berakhir.',
            ]);
        }

        $record = $attendanceScanService->record($request->user(), $session);

        if (! $record->wasRecentlyCreated) {
            Inertia::flash('toast', ['type' => 'warning', 'message' => __('Anda sudah absen pada sesi ini.')]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Absensi berhasil direkam.')]);

        return back();
    }
}
