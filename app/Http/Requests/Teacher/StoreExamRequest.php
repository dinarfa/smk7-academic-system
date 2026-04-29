<?php

namespace App\Http\Requests\Teacher;

use App\Models\Subject;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreExamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isTeacher();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'class_id' => ['required', 'exists:school_classes,id'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:480'],
            'instructions' => ['nullable', 'string', 'max:2000'],
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
            'title.required' => 'Exam title is required.',
            'title.max' => 'Exam title cannot exceed 255 characters.',
            'subject_id.required' => 'Subject is required.',
            'subject_id.exists' => 'The selected subject does not exist.',
            'class_id.required' => 'Class is required.',
            'class_id.exists' => 'The selected class does not exist.',
            'duration_minutes.required' => 'Duration is required.',
            'duration_minutes.min' => 'Duration must be at least 5 minutes.',
            'duration_minutes.max' => 'Duration cannot exceed 480 minutes.',
            'instructions.max' => 'Instructions cannot exceed 2000 characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure subject and class belong together (subject must be in the specified class)
        if ($this->has('subject_id') && $this->has('class_id')) {
            $subject = Subject::find($this->input('subject_id'));
            if ($subject && $subject->school_class_id != $this->input('class_id')) {
                $this->merge(['subject_id' => null]); // Force validation failure
            }
        }
    }
}
