<?php

namespace App\Http\Requests\Admin;

use App\Models\Subject;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubjectRequest extends FormRequest
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
        /** @var Subject $subject */
        $subject = $this->route('subject');

        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('subjects', 'code')->ignore($subject->id)],
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
