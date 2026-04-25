<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\ScanAttendanceRequest;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
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
    public function scan(ScanAttendanceRequest $request): RedirectResponse
    {
        $rawToken = trim($request->validated('qr_token'));
        $token = $this->extractToken($rawToken);

        $session = AttendanceSession::query()
            ->where('qr_token', $token)
            ->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where(function ($query): void {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->first();

        if (! $session) {
            return back()->withErrors([
                'qr_token' => 'QR tidak valid atau sesi sudah berakhir.',
            ]);
        }

        $record = AttendanceRecord::query()->firstOrCreate(
            [
                'attendance_session_id' => $session->id,
                'student_id' => $request->user()->id,
            ],
            [
                'status' => 'present',
                'scanned_at' => now(),
            ],
        );

        if (! $record->wasRecentlyCreated) {
            Inertia::flash('toast', ['type' => 'warning', 'message' => __('Anda sudah absen pada sesi ini.')]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Absensi berhasil direkam.')]);

        return back();
    }

    /**
     * Normalize a scanned payload into a qr_token value.
     */
    private function extractToken(string $rawToken): string
    {
        if (str_starts_with($rawToken, 'attendance:')) {
            return str($rawToken)->after('attendance:')->toString();
        }

        if (str_contains($rawToken, '?')) {
            $query = parse_url($rawToken, PHP_URL_QUERY);

            if ($query) {
                parse_str($query, $params);

                if (! empty($params['token']) && is_string($params['token'])) {
                    return $params['token'];
                }
            }
        }

        return $rawToken;
    }
}
