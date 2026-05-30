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
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('subjects', 'name')],
            'school_class_ids' => ['sometimes', 'array', 'min:1'],
            'school_class_ids.*' => ['integer', Rule::exists('school_classes', 'id')],
            'class_teachers' => ['sometimes', 'array'],
            'class_teachers.*' => ['nullable', 'integer', Rule::exists('users', 'id')->where('role', UserRole::Teacher->value)],
        ];
    }
}
