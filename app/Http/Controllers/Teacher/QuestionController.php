<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreQuestionRequest;
use App\Http\Requests\Teacher\UpdateQuestionRequest;
use App\Models\Exam;
use App\Models\Question;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    use AuthorizesRequests;

    /**
     * Show all questions for an exam.
     */
    public function index(Exam $exam): Response
    {
        $this->authorize('view', $exam);

        $questions = $exam->questions()
            ->with('answerOptions')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Question $question): array => [
                'id' => $question->id,
                'prompt' => $question->prompt,
                'type' => $question->type,
                'points' => $question->points,
                'sort_order' => $question->sort_order,
                'explanation' => $question->explanation,
                'answer_options' => $question->answerOptions->map(fn ($option): array => [
                    'id' => $option->id,
                    'option_text' => $option->option_text,
                    'is_correct' => $option->is_correct,
                    'sort_order' => $option->sort_order,
                ])->toArray(),
                'created_at' => $question->created_at?->toIso8601String(),
                'updated_at' => $question->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('teacher/questions/index', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'instructions' => $exam->instructions,
            ],
            'questions' => $questions,
        ]);
    }

    /**
     * Show the form for creating a new question.
     */
    public function create(Exam $exam): Response
    {
        $this->authorize('view', $exam);

        return Inertia::render('teacher/questions/create', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
            ],
        ]);
    }

    /**
     * Store a newly created question with answer options.
     */
    public function store(StoreQuestionRequest $request, Exam $exam): RedirectResponse
    {
        $this->authorize('view', $exam);

        $validated = $request->validated();

        // Extract answer options from validated data
        $answerOptionsData = $validated['answer_options'];
        unset($validated['answer_options']);

        // Create the question
        $question = $exam->questions()->create($validated);

        // Create answer options
        foreach ($answerOptionsData as $index => $optionData) {
            $question->answerOptions()->create([
                'option_text' => $optionData['option_text'],
                'is_correct' => $optionData['is_correct'],
                'sort_order' => $index,
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Question created successfully.')]);

        return to_route('teacher.exams.questions.index', $exam);
    }

    /**
     * Show the form for editing a question.
     */
    public function edit(Exam $exam, Question $question): Response
    {
        $this->authorize('view', $exam);

        if ($question->exam_id !== $exam->id) {
            abort(404);
        }

        return Inertia::render('teacher/questions/edit', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
            ],
            'question' => [
                'id' => $question->id,
                'prompt' => $question->prompt,
                'type' => $question->type,
                'points' => $question->points,
                'sort_order' => $question->sort_order,
                'explanation' => $question->explanation,
                'answer_options' => $question->answerOptions->map(fn ($option): array => [
                    'id' => $option->id,
                    'option_text' => $option->option_text,
                    'is_correct' => $option->is_correct,
                    'sort_order' => $option->sort_order,
                ])->toArray(),
            ],
        ]);
    }

    /**
     * Update the specified question and its answer options.
     */
    public function update(UpdateQuestionRequest $request, Exam $exam, Question $question): RedirectResponse
    {
        $this->authorize('view', $exam);

        if ($question->exam_id !== $exam->id) {
            abort(404);
        }

        $validated = $request->validated();

        // Extract answer options from validated data
        $answerOptionsData = $validated['answer_options'];
        unset($validated['answer_options']);

        // Update the question
        $question->update($validated);

        // Sync answer options (delete old ones and create new ones)
        $question->answerOptions()->delete();
        foreach ($answerOptionsData as $index => $optionData) {
            $question->answerOptions()->create([
                'option_text' => $optionData['option_text'],
                'is_correct' => $optionData['is_correct'],
                'sort_order' => $index,
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Question updated successfully.')]);

        return to_route('teacher.exams.questions.index', $exam);
    }

    /**
     * Remove the specified question.
     */
    public function destroy(Exam $exam, Question $question): RedirectResponse
    {
        $this->authorize('view', $exam);

        if ($question->exam_id !== $exam->id) {
            abort(404);
        }

        $question->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Question deleted successfully.')]);

        return to_route('teacher.exams.questions.index', $exam);
    }
}
