<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamAttemptController extends Controller
{
    /**
     * Start an exam attempt for the authenticated student.
     */
    public function store(Request $request, Exam $exam): JsonResponse
    {
        $user = $request->user();

        // Validate exam is active and in time window
        $now = now();
        abort_unless($exam->status === 'active', 404);
        abort_unless($exam->class_id === $user->school_class_id, 403);

        if ($exam->starts_at && $exam->starts_at > $now) {
            return response()->json(['message' => 'Ujian belum dimulai.'], 422);
        }
        if ($exam->ends_at && $exam->ends_at < $now) {
            return response()->json(['message' => 'Ujian sudah berakhir.'], 422);
        }

        // Validate access code if required
        if ($exam->access_code) {
            $request->validate([
                'access_code' => 'required|string',
            ]);
            if ($request->access_code !== $exam->access_code) {
                return response()->json(['message' => 'Kode akses salah.'], 422);
            }
        }

        $attempt = ExamAttempt::firstOrCreate(
            ['exam_id' => $exam->id, 'student_id' => $user->id],
            ['started_at' => now(), 'status' => 'in_progress'],
        );

        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'Anda sudah menyelesaikan ujian ini.'], 422);
        }

        return response()->json([
            'data' => [
                'id' => $attempt->id,
                'status' => $attempt->status,
                'started_at' => $attempt->started_at?->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Get an active attempt with exam questions and existing responses.
     */
    public function show(Request $request, Exam $exam, ExamAttempt $attempt): JsonResponse
    {
        $student = $request->user();

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
            ->merge($exam->questions->map(fn ($question) => [
                'id' => $question->id,
                'prompt' => $question->prompt,
                'type' => $question->type,
                'points' => $question->points,
                'sort_order' => $question->sort_order,
                'answer_options' => $question->answerOptions->map(fn ($option) => [
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
            ->merge($exam->attachedQuestions->map(fn ($question) => [
                'id' => $question->id,
                'prompt' => $question->prompt,
                'type' => $question->type,
                'points' => $question->points,
                'sort_order' => $question->pivot?->sort_order ?? $question->sort_order,
                'answer_options' => $question->answerOptions->map(fn ($option) => [
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

        return response()->json([
            'data' => [
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
            ],
        ]);
    }
}
