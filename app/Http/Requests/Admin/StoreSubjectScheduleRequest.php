<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubjectScheduleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('subject_id') && $this->input('subject_id') === '') {
            $this->merge(['subject_id' => null]);
        }

        // Normalize H:i:s to H:i
        foreach (['starts_at', 'ends_at'] as $field) {
            if ($this->has($field) && strlen($this->input($field)) === 8) {
                $this->merge([$field => substr($this->input($field), 0, 5)]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'school_class_id' => ['required', 'integer', Rule::exists('school_classes', 'id')],
            'subject_id' => ['nullable', 'integer', Rule::exists('subjects', 'id')],
            'schedule_type' => ['required', 'string', Rule::in(['morning', 'subject', 'dismissal'])],
            'day_of_week' => ['required', 'integer', 'min:0', 'max:6'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i', 'after:starts_at'],
        ];
    }
}
