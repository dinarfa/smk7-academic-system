<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSchoolClassRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'homeroom_teacher_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', UserRole::Teacher->value)],
            'department_id' => ['required', 'integer', Rule::exists('departments', 'id')],
            'grade_level' => ['required', 'string', 'max:10'],
            'section' => ['required', 'integer', 'min:1'],
            'code' => ['nullable', 'string', 'max:50', Rule::unique('school_classes', 'code')],
            'academic_year' => ['nullable', 'string', 'max:20'],
        ];
    }
}
