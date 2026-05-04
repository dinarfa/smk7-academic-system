<?php

namespace App\Http\Requests\Student;

use App\Models\AnswerOption;
use App\Models\ExamAttempt;
use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveExamResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user || ! method_exists($user, 'isStudent') || ! $user->isStudent()) {
            return false;
        }

        $attempt = $this->route('attempt');
        if (! $attempt instanceof ExamAttempt) {
            return false;
        }

        // attempt must belong to student and be in progress
        if ($attempt->student_id !== $user->id) {
            return false;
        }

        if ($attempt->status !== 'in_progress') {
            return false;
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'question_id' => ['required', 'integer', Rule::exists('questions', 'id')],
            'answer_option_id' => ['nullable', 'integer', Rule::exists('answer_options', 'id')],
            'response_text' => ['nullable', 'string', 'max:5000'],
            // optional 'autosave' flag not required, handled client-side
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $attempt = $this->route('attempt');
            $questionId = (int) $this->input('question_id');

            // ensure question belongs to the exam (either authored or attached)
            $exam = $attempt->exam;
            /** @var Question|null $question */
            $question = Question::find($questionId);
            if (! $question) {
                $validator->errors()->add('question_id', 'Question not found.');

                return;
            }

            $belongs = $exam->questions()->where('questions.id', $questionId)->exists()
                || $exam->attachedQuestions()->where('questions.id', $questionId)->exists();

            if (! $belongs) {
                $validator->errors()->add('question_id', 'Question does not belong to this exam.');

                return;
            }

            $answerOptionId = $this->input('answer_option_id');
            if ($answerOptionId) {
                $optionOk = AnswerOption::where('id', $answerOptionId)
                    ->where('question_id', $questionId)
                    ->exists();

                if (! $optionOk) {
                    $validator->errors()->add('answer_option_id', 'Answer option does not belong to the specified question.');
                }
            }
        });
    }
}
