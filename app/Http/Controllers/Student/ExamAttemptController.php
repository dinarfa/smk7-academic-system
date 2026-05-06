<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StartExamAttemptRequest;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamAttemptController extends Controller
{
    /**
     * Start an exam attempt for the authenticated student.
     */
    public function store(StartExamAttemptRequest $request, Exam $exam): RedirectResponse
    {
        $user = $request->user();

        // Check for any existing attempt for this student and exam.
        $existing = ExamAttempt::where('exam_id', $exam->id)
            ->where('student_id', $user->id)
            ->first();

        if ($existing) {
            if ($existing->status === 'in_progress') {
                return redirect()->route('student.exams.attempts.show', [
                    'exam' => $exam,
                    'attempt' => $existing,
                ]);
            }

            return redirect()->route('student.exams.index')
                ->with('error', 'You have already completed this exam.');
        }

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'student_id' => $user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        return redirect()->route('student.exams.attempts.show', [
            'exam' => $exam,
            'attempt' => $attempt,
        ]);
    }

    /**
     * Display an active attempt with the exam questions.
     */
    public function show(Request $request, Exam $exam, ExamAttempt $attempt): Response
    {
        $student = $request->user();

        abort_unless($student && $student->isStudent(), 403);
        abort_unless($attempt->student_id === $student->id, 403);
        abort_unless($attempt->exam_id === $exam->id, 404);
        abort_unless($exam->status === 'active', 404);
        abort_unless($attempt->status === 'in_progress', 404);

        $exam->load([
            'subject:id,name',
            'questions.answerOptions',
            'attachedQuestions.answerOptions',
        ]);

        $responses = $attempt->responses()
            ->with('answerOption')
            ->get()
            ->keyBy('question_id');

        $questions = collect()
            ->merge($exam->questions->map(fn($question) => [
                'id' => $question->id,
                'prompt' => $question->prompt,
                'type' => $question->type,
                'points' => $question->points,
                'sort_order' => $question->sort_order,
                'answer_options' => $question->answerOptions->map(fn($option) => [
                    'id' => $option->id,
                    'option_text' => $option->option_text,
                    'sort_order' => $option->sort_order,
                ])->values()->all(),
                'response' => $responses->has($question->id) ? [
                    'answer_option_id' => $responses[$question->id]->answer_option_id,
                    'response_text' => $responses[$question->id]->response_text,
                ] : null,
                'source_sort_order' => $question->sort_order,
            ]))
            ->merge($exam->attachedQuestions->map(fn($question) => [
                'id' => $question->id,
                'prompt' => $question->prompt,
                'type' => $question->type,
                'points' => $question->points,
                'sort_order' => $question->pivot?->sort_order ?? $question->sort_order,
                'answer_options' => $question->answerOptions->map(fn($option) => [
                    'id' => $option->id,
                    'option_text' => $option->option_text,
                    'sort_order' => $option->sort_order,
                ])->values()->all(),
                'response' => $responses->has($question->id) ? [
                    'answer_option_id' => $responses[$question->id]->answer_option_id,
                    'response_text' => $responses[$question->id]->response_text,
                ] : null,
                'source_sort_order' => $question->pivot?->sort_order ?? $question->sort_order,
            ]))
            ->unique('id')
            ->sortBy('source_sort_order')
            ->values();

        return Inertia::render('student/exams/show', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'subject' => $exam->subject?->name,
                'duration_minutes' => $exam->duration_minutes,
                'starts_at' => $exam->starts_at?->toIso8601String(),
                'ends_at' => $exam->ends_at?->toIso8601String(),
                'status' => $exam->status,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'status' => $attempt->status,
                'started_at' => $attempt->started_at?->toIso8601String(),
            ],
            'questions' => $questions,
        ]);
    }
}
