<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SubmitExamAttemptRequest;
use App\Models\ExamAttempt;
use Illuminate\Http\JsonResponse;

class ExamSubmissionController extends Controller
{
    /**
     * Submit an exam attempt: mark submitted, set submitted_at, and lock further changes.
     */
    public function store(SubmitExamAttemptRequest $request, $exam, ExamAttempt $attempt): JsonResponse
    {
        // Double-check attempt belongs to exam
        if ($attempt->exam_id !== $request->route('exam')->id) {
            return response()->json(['message' => 'Attempt does not belong to this exam.'], 400);
        }

        // Mark submitted and store timestamp
        $attempt->status = 'submitted';
        $attempt->submitted_at = now();
        $attempt->save();

        // After submission, further `SaveExamResponseRequest` will be rejected
        return response()->json(['attempt' => $attempt], 200);
    }
}
