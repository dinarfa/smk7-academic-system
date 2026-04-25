<?php

namespace App\Http\Requests\Teacher;

use App\Enums\AttendanceQrType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OpenAttendanceSessionRequest extends FormRequest
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
            'type' => ['required', Rule::enum(AttendanceQrType::class)],
            'subject' => ['nullable', 'string', 'max:100', 'required_if:type,'.AttendanceQrType::Subject->value],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:480'],
        ];
    }
}
