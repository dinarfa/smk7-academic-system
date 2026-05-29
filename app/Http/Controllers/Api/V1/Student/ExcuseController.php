<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Models\Excuse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExcuseController extends Controller
{
    /**
     * Get excuses for the authenticated student.
     */
    public function index(Request $request): JsonResponse
    {
        $student = $request->user();

        $excuses = Excuse::query()
            ->where('student_id', $student->id)
            ->with(['attendanceRecord', 'reviewedBy'])
            ->latest('created_at')
            ->paginate(20)
            ->through(fn (Excuse $excuse) => [
                'id' => $excuse->id,
                'type' => $excuse->type->value,
                'reason' => $excuse->reason,
                'status' => $excuse->status->value,
                'excused_date' => $excuse->excused_date->toDateString(),
                'review_notes' => $excuse->review_notes,
                'reviewed_by' => $excuse->reviewedBy ? [
                    'id' => $excuse->reviewedBy->id,
                    'name' => $excuse->reviewedBy->name,
                ] : null,
                'created_at' => $excuse->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'data' => $excuses,
        ]);
    }

    /**
     * Create a new excuse submission.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:sick,permission,other',
            'reason' => 'required|string|max:500',
            'excused_date' => 'required|date|before_or_equal:today',
            'attendance_record_id' => 'nullable|exists:attendance_records,id',
        ]);

        $validated = $request->only(['type', 'reason', 'excused_date', 'attendance_record_id']);

        // Verify attendance record belongs to student if provided
        if (! empty($validated['attendance_record_id'])) {
            $record = auth()->user()->attendanceRecords()
                ->where('id', $validated['attendance_record_id'])
                ->firstOrFail();
        }

        $excuse = Excuse::create([
            'student_id' => auth()->id(),
            'submitted_by' => auth()->id(),
            'attendance_record_id' => $validated['attendance_record_id'] ?? null,
            'type' => $validated['type'],
            'reason' => $validated['reason'],
            'excused_date' => $validated['excused_date'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Izin telah diajukan. Menunggu persetujuan guru.',
            'data' => [
                'id' => $excuse->id,
                'type' => $excuse->type->value,
                'reason' => $excuse->reason,
                'status' => $excuse->status->value,
                'excused_date' => $excuse->excused_date->toDateString(),
            ],
        ], 201);
    }

    /**
     * Get detail of a specific excuse.
     */
    public function show(Request $request, Excuse $excuse): JsonResponse
    {
        abort_unless($excuse->student_id === auth()->id(), 403);

        $excuse->load(['attendanceRecord', 'reviewedBy']);

        return response()->json([
            'data' => [
                'id' => $excuse->id,
                'type' => $excuse->type->value,
                'reason' => $excuse->reason,
                'status' => $excuse->status->value,
                'excused_date' => $excuse->excused_date->toDateString(),
                'review_notes' => $excuse->review_notes,
                'attendance_record' => $excuse->attendanceRecord ? [
                    'id' => $excuse->attendanceRecord->id,
                    'status' => $excuse->attendanceRecord->status,
                    'scanned_at' => $excuse->attendanceRecord->scanned_at?->toIso8601String(),
                ] : null,
                'reviewed_by' => $excuse->reviewedBy ? [
                    'id' => $excuse->reviewedBy->id,
                    'name' => $excuse->reviewedBy->name,
                ] : null,
                'created_at' => $excuse->created_at?->toIso8601String(),
            ],
        ]);
    }
}
