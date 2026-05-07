<?php

namespace App\Http\Requests;

use App\Enums\AttendanceQrType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ManualAttendanceRequest extends FormRequest
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
            'session_id' => ['required', 'integer', 'exists:attendance_sessions,id'],
            'phase' => ['required', Rule::enum(AttendanceQrType::class)],
            'students' => ['required', 'array', 'min:1'],
            'students.*.student_id' => ['required', 'integer', 'exists:users,id'],
            'students.*.status' => ['required', 'string', 'in:present,late,absent'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'students.required' => 'At least one student must be selected.',
            'students.*.student_id.exists' => 'Selected student does not exist.',
            'students.*.status.in' => 'Status must be present, late, or absent.',
        ];
    }
}
