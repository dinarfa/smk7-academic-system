<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->department_id === '0' || $this->department_id === 0) {
            $this->merge(['department_id' => null]);
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
            'name' => ['required', 'string', 'max:255', Rule::unique('subjects', 'name')],
            'department_id' => ['nullable', 'integer', Rule::exists('departments', 'id')],
            'school_class_ids' => ['sometimes', 'array', 'min:1'],
            'school_class_ids.*' => ['integer', Rule::exists('school_classes', 'id')],
            'class_teachers' => ['sometimes', 'array'],
            'class_teachers.*' => ['nullable', 'integer', Rule::exists('users', 'id')->where('role', UserRole::Teacher->value)],
        ];
    }
}
