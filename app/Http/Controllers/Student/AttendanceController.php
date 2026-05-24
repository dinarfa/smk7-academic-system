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
            ->with('session:id,type,subject,subject_id,starts_at,ends_at')
            ->with('session.subjectModel:id,name')
            ->latest('scanned_at')
            ->paginate(15)
            ->through(fn (AttendanceRecord $record): array => [
                'id' => $record->id,
                'status' => $record->status,
                'scanned_at' => $record->scanned_at?->toIso8601String(),
                'session' => [
                    'type' => $record->session?->type,
                    'subject' => $record->session?->subjectModel?->name ?? $record->session?->subject,
                    'starts_at' => $record->session?->starts_at?->toIso8601String(),
                    'ends_at' => $record->session?->ends_at?->toIso8601String(),
                ],
            ]);

        $stats = AttendanceRecord::query()
            ->where('student_id', $student->id)
            ->selectRaw("count(*) as total")
            ->selectRaw("sum(case when status = 'present' then 1 else 0 end) as present")
            ->selectRaw("sum(case when status = 'late' then 1 else 0 end) as late")
            ->selectRaw("sum(case when status in ('absent', 'bolos') then 1 else 0 end) as absent")
            ->first();

        return Inertia::render('student/attendance', [
            'records' => $records,
            'overallStats' => [
                'total' => (int) ($stats->total ?? 0),
                'present' => (int) ($stats->present ?? 0),
                'late' => (int) ($stats->late ?? 0),
                'absent' => (int) ($stats->absent ?? 0),
            ],
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

        if (! $attendanceScanService->isStudentAllowed($request->user(), $session)) {
            return back()->withErrors([
                'qr_token' => 'Anda tidak memiliki akses untuk mengisi absensi pada sesi ini. Hanya murid dari kelas yang bersangkutan yang dapat melakukan scan.',
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
