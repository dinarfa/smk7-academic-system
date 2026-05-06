<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SubmitExamAttemptRequest;
use App\Models\ExamAttempt;
use Illuminate\Http\RedirectResponse;

class ExamSubmissionController extends Controller
{
    /**
     * Submit an exam attempt: mark submitted, set submitted_at, and lock further changes.
     */
    public function store(SubmitExamAttemptRequest $request, \App\Models\Exam $exam, ExamAttempt $attempt): RedirectResponse
    {
        // Double-check attempt belongs to exam
        if ($attempt->exam_id !== $exam->id) {
            return response()->json(['message' => 'Attempt does not belong to this exam.'], 400);
        }

        // Calculate score
        $examModel = $exam;
        
        $totalPointsAwarded = $attempt->responses()->sum('points_awarded');
        
        // Get total possible points from both direct questions and attached question bank questions
        $directPoints = $examModel->questions()->sum('points');
        $attachedPoints = $examModel->attachedQuestions()->sum('points');
        $totalPossiblePoints = $directPoints + $attachedPoints;
        
        $normalizedScore = 0;
        if ($totalPossiblePoints > 0) {
            $normalizedScore = ($totalPointsAwarded / $totalPossiblePoints) * 100;
        }

        // Mark submitted, store timestamp, and store score
        $attempt->status = 'submitted';
        $attempt->submitted_at = now();
        $attempt->score = $normalizedScore;
        $attempt->save();

        // After submission, further `SaveExamResponseRequest` will be rejected
        return redirect()->route('student.exams.index')
            ->with('success', 'Ujian berhasil dikumpulkan.');
    }
}
