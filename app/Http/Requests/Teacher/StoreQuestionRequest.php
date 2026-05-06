<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $exam = $this->route('exam');

        return $exam->created_by === auth()->id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'max:5000'],
            'type' => ['required', 'string', 'in:multiple_choice,essay'],
            'points' => ['required', 'integer', 'min:1', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'explanation' => ['nullable', 'string', 'max:2000'],
            'answer_options' => ['required_unless:type,essay', 'array', 'min:2', 'max:10'],
            'answer_options.*.option_text' => ['required_with:answer_options', 'string', 'max:1000'],
            'answer_options.*.is_correct' => ['required_with:answer_options', 'boolean'],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'answer_options.min' => 'At least 2 answer options are required.',
            'answer_options.max' => 'Maximum 10 answer options allowed.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->type !== 'essay') {
            // Validate that at least one answer is marked as correct
            $hasCorrectAnswer = collect($this->answer_options ?? [])->some(fn ($option) => $option['is_correct'] ?? false);
            if (! $hasCorrectAnswer) {
                $this->merge(['answer_options' => null]); // Force validation failure
            }
        } else {
            // Remove answer options for essay questions
            $this->request->remove('answer_options');
            $this->json()->remove('answer_options');
        }
    }
}
