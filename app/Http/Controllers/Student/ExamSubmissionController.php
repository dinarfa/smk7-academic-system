<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SubmitExamAttemptRequest;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Services\ExamScorer;
use Illuminate\Http\RedirectResponse;

class ExamSubmissionController extends Controller
{
    /**
     * Submit an exam attempt: mark submitted, set submitted_at, and lock further changes.
     */
    public function store(SubmitExamAttemptRequest $request, Exam $exam, ExamAttempt $attempt): RedirectResponse
    {
        // Double-check attempt belongs to exam
        if ($attempt->exam_id !== $exam->id) {
            return response()->json(['message' => 'Attempt does not belong to this exam.'], 400);
        }

        // Score the attempt using the shared scorer
        $scorer = app(ExamScorer::class);
        $scorer->scoreAttempt($attempt);

        // Mark submitted and store timestamp
        $attempt->status = 'submitted';
        $attempt->submitted_at = now();
        $attempt->save();

        // After submission, further `SaveExamResponseRequest` will be rejected
        return redirect()->route('student.exams.index')
            ->with('success', 'Ujian berhasil dikumpulkan.');
    }
}
