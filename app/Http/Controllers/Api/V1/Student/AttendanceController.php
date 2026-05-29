<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Services\Attendance\AttendanceScanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Get paginated attendance history with stats.
     */
    public function index(Request $request): JsonResponse
    {
        $student = $request->user();

        $records = AttendanceRecord::query()
            ->where('student_id', $student->id)
            ->with('session:id,type,subject,subject_id,starts_at,ends_at')
            ->with('session.subjectModel:id,name')
            ->latest('scanned_at')
            ->paginate(15)
            ->through(fn (AttendanceRecord $record) => [
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
            ->selectRaw('count(*) as total')
            ->selectRaw("sum(case when status = 'present' then 1 else 0 end) as present")
            ->selectRaw("sum(case when status = 'late' then 1 else 0 end) as late")
            ->selectRaw("sum(case when status in ('absent', 'bolos') then 1 else 0 end) as absent")
            ->first();

        return response()->json([
            'data' => [
                'records' => $records,
                'stats' => [
                    'total' => (int) ($stats->total ?? 0),
                    'present' => (int) ($stats->present ?? 0),
                    'late' => (int) ($stats->late ?? 0),
                    'absent' => (int) ($stats->absent ?? 0),
                ],
            ],
        ]);
    }

    /**
     * Submit attendance from scanned QR token.
     */
    public function scan(Request $request, AttendanceScanService $scanService): JsonResponse
    {
        $request->validate([
            'qr_token' => 'required|string|max:500',
        ]);

        $rawToken = trim($request->input('qr_token'));
        $token = $scanService->extractToken($rawToken);
        $session = $scanService->findActiveSessionByToken($token);

        if (! $session) {
            return response()->json([
                'message' => 'QR tidak valid atau sesi sudah berakhir.',
            ], 422);
        }

        if (! $scanService->isStudentAllowed($request->user(), $session)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk mengisi absensi pada sesi ini.',
            ], 403);
        }

        $record = $scanService->record($request->user(), $session);

        if (! $record->wasRecentlyCreated) {
            return response()->json([
                'message' => 'Anda sudah absen pada sesi ini.',
                'data' => [
                    'id' => $record->id,
                    'status' => $record->status,
                    'scanned_at' => $record->scanned_at?->toIso8601String(),
                ],
            ]);
        }

        return response()->json([
            'message' => 'Absensi berhasil direkam.',
            'data' => [
                'id' => $record->id,
                'status' => $record->status,
                'scanned_at' => $record->scanned_at?->toIso8601String(),
            ],
        ], 201);
    }
}
