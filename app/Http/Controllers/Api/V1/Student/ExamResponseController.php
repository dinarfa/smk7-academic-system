<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Models\AnswerOption;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamResponse;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamResponseController extends Controller
{
    /**
     * Save (or autosave) a student's response for a question.
     */
    public function store(Request $request, Exam $exam, ExamAttempt $attempt): JsonResponse
    {
        abort_unless($attempt->student_id === auth()->id(), 403);
        abort_unless($attempt->exam_id === $exam->id, 404);
        abort_unless($attempt->status === 'in_progress', 422);

        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'answer_option_id' => 'nullable|exists:answer_options,id',
            'response_text' => 'nullable|string|max:5000',
        ]);

        $data = $request->only(['question_id', 'answer_option_id', 'response_text']);
        $question = Question::findOrFail($data['question_id']);

        $payload = [
            'exam_attempt_id' => $attempt->id,
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
            $payload['is_correct'] = null;
            $payload['points_awarded'] = null;
        }

        // Upsert response
        ExamResponse::updateOrCreate(
            ['exam_attempt_id' => $attempt->id, 'question_id' => $question->id],
            $payload
        );

        return response()->json([
            'message' => 'Jawaban tersimpan.',
        ]);
    }
}
