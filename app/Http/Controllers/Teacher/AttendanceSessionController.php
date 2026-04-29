<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\OpenAttendanceSessionRequest;
use App\Models\AttendanceSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AttendanceSessionController extends Controller
{
    /**
     * Open a new QR attendance session.
     */
    public function store(OpenAttendanceSessionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $activeSessions = AttendanceSession::query()
            ->where('opened_by', $request->user()->id)
            ->where('is_active', true)
            ->where('type', $validated['type'])
            ->get();

        $activeSessions->each(static function (AttendanceSession $attendanceSession): void {
            Gate::authorize('update', $attendanceSession);

            $attendanceSession->update([
                'is_active' => false,
                'ends_at' => now(),
            ]);
        });

        AttendanceSession::query()->create([
            'opened_by' => $request->user()->id,
            'type' => $validated['type'],
            'subject' => $validated['subject'] ?? null,
            'qr_token' => (string) str()->ulid(),
            'starts_at' => now(),
            'ends_at' => now()->addMinutes((int) ($validated['duration_minutes'] ?? 30)),
            'is_active' => true,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('QR absensi berhasil dibuka.')]);

        return back();
    }

    /**
     * Close an active attendance session.
     */
    public function close(AttendanceSession $attendanceSession): RedirectResponse
    {
        Gate::authorize('close', $attendanceSession);

        $attendanceSession->update([
            'is_active' => false,
            'ends_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Sesi QR ditutup.')]);

        return back();
    }
}
