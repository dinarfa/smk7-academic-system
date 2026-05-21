<?php

namespace App\Http\Requests;

use App\Enums\AttendanceQrType;
use App\Models\User;
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
            'session_id' => ['sometimes', 'nullable', 'integer', 'exists:attendance_sessions,id'],
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

    /**
     * Get the "after" validation callables for the request.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function ($validator) {
                $teacher = auth()->user();

                // Homeroom class IDs
                $classIds = $teacher->homeroomClasses()->pluck('id')->toArray();

                // Subject-taught class IDs
                $subjectClassIds = $teacher->subjects()
                    ->pluck('school_class_id')
                    ->filter()
                    ->unique()
                    ->toArray();

                $allowedClassIds = array_unique(array_merge($classIds, $subjectClassIds));

                if (empty($allowedClassIds)) {
                    return;
                }

                foreach ($this->input('students', []) as $index => $student) {
                    $studentId = $student['student_id'] ?? null;
                    if ($studentId) {
                        $studentClass = User::find($studentId)?->school_class_id;
                        if (! $studentClass || ! in_array($studentClass, $allowedClassIds)) {
                            $validator->errors()->add(
                                "students.{$index}.student_id",
                                "Student ID {$studentId} is not in your assigned class."
                            );
                        }
                    }
                }
            },
        ];
    }
}
