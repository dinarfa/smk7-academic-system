<?php

namespace App\Http\Requests\Teacher;

use App\Models\Question;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AttachExamQuestionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $exam = $this->route('exam');

        return auth()->check()
            && auth()->user()->isTeacher()
            && $exam->created_by === auth()->id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'question_ids' => ['required', 'array', 'min:1'],
            'question_ids.*' => ['required', 'integer', 'distinct', 'exists:questions,id'],
        ];
    }

    /**
     * Ensure all selected questions belong to the current teacher.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $questionIds = collect($this->input('question_ids', []))
                ->filter()
                ->map(fn ($questionId): int => (int) $questionId)
                ->values();

            if ($questionIds->isEmpty()) {
                return;
            }

            $ownedCount = Question::query()
                ->whereIn('id', $questionIds)
                ->whereHas('exam', fn ($query) => $query->where('created_by', auth()->id()))
                ->count();

            if ($ownedCount !== $questionIds->count()) {
                $validator->errors()->add('question_ids', 'One or more selected questions are not available to this teacher.');
            }
        });
    }
}
