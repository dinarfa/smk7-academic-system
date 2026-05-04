<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StartExamAttemptRequest;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\JsonResponse;

class ExamAttemptController extends Controller
{
    /**
     * Start an exam attempt for the authenticated student.
     */
    public function store(StartExamAttemptRequest $request, Exam $exam): JsonResponse
    {
        $user = $request->user();

        // Check for any existing attempt for this student and exam.
        $existing = ExamAttempt::where('exam_id', $exam->id)
            ->where('student_id', $user->id)
            ->first();

        if ($existing) {
            if ($existing->status === 'in_progress') {
                return response()->json([
                    'message' => 'An active attempt already exists.',
                    'attempt' => $existing,
                ], 409);
            }

            // Existing attempt found (submitted or otherwise). Because the
            // schema enforces a unique exam_id/student_id pair, we return
            // the existing attempt instead of creating a new one.
            return response()->json([
                'message' => 'An attempt already exists for this exam.',
                'attempt' => $existing,
            ], 409);
        }

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'student_id' => $user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        return response()->json(['attempt' => $attempt], 201);
    }
}
