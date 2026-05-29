<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Services\ExamScorer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamSubmissionController extends Controller
{
    /**
     * Submit an exam attempt: mark submitted, score, and lock.
     */
    public function store(Request $request, Exam $exam, ExamAttempt $attempt): JsonResponse
    {
        abort_unless($attempt->student_id === auth()->id(), 403);
        abort_unless($attempt->exam_id === $exam->id, 404);
        abort_unless($attempt->status === 'in_progress', 422);

        // Score the attempt
        $scorer = app(ExamScorer::class);
        $scorer->scoreAttempt($attempt);

        // Mark submitted
        $attempt->status = 'submitted';
        $attempt->submitted_at = now();
        $attempt->save();

        return response()->json([
            'message' => 'Ujian berhasil dikumpulkan.',
            'data' => [
                'id' => $attempt->id,
                'status' => $attempt->status,
                'submitted_at' => $attempt->submitted_at?->toIso8601String(),
                'score' => $attempt->score,
            ],
        ]);
    }
}
