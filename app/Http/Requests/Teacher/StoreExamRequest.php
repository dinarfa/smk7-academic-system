<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $teacherId = $this->user()?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'subject_id' => [
                'required',
                'integer',
                Rule::exists('subjects', 'id')->where(fn ($query) => $query->where('teacher_id', $teacherId)),
            ],
            'class_id' => [
                'required',
                'integer',
                Rule::exists('subjects', 'school_class_id')->where(fn ($query) => $query
                    ->where('teacher_id', $teacherId)
                    ->where('id', $this->input('subject_id'))),
            ],
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
            'subject_id.exists' => 'The selected subject is not assigned to you.',
            'class_id.required' => 'Class is required.',
            'class_id.exists' => 'The selected class is not valid for the selected subject.',
            'duration_minutes.required' => 'Duration is required.',
            'duration_minutes.min' => 'Duration must be at least 5 minutes.',
            'duration_minutes.max' => 'Duration cannot exceed 480 minutes.',
            'instructions.max' => 'Instructions cannot exceed 2000 characters.',
        ];
    }
}
