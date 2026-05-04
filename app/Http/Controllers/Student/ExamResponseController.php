<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SaveExamResponseRequest;
use App\Models\AnswerOption;
use App\Models\ExamResponse;
use App\Models\Question;
use Illuminate\Http\JsonResponse;

class ExamResponseController extends Controller
{
    /**
     * Save (or autosave) a student's response for a question.
     */
    public function store(SaveExamResponseRequest $request, $exam, $attempt): JsonResponse
    {
        $data = $request->validated();
        $attemptModel = $request->route('attempt');

        $question = Question::findOrFail($data['question_id']);

        $payload = [
            'exam_attempt_id' => $attemptModel->id,
            'question_id' => $question->id,
            'response_text' => $data['response_text'] ?? null,
            'answer_option_id' => $data['answer_option_id'] ?? null,
        ];

        // Determine correctness and points for objective options
        if (! empty($payload['answer_option_id'])) {
            $option = AnswerOption::find($payload['answer_option_id']);
            $isCorrect = $option->is_correct;
            $points = $isCorrect ? (float) $question->points : 0.0;
            $payload['is_correct'] = $isCorrect;
            $payload['points_awarded'] = $points;
        } else {
            // For subjective answers, leave grading fields null for later review
            $payload['is_correct'] = null;
            $payload['points_awarded'] = null;
        }

        // Upsert response (unique constraint on attempt + question)
        $response = ExamResponse::updateOrCreate(
            ['exam_attempt_id' => $attemptModel->id, 'question_id' => $question->id],
            $payload
        );

        return response()->json(['response' => $response], 200);
    }
}
