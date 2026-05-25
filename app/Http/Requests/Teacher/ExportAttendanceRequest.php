<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ExportAttendanceRequest extends FormRequest
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
            'startDate' => ['required', 'date'],
            'endDate' => ['required', 'date', 'after_or_equal:startDate'],
            'format' => ['nullable', 'string', 'in:csv,xlsx'],
            'classId' => ['nullable', 'integer'],
            'subjectId' => ['nullable', 'integer'],
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

                $subjectClassIds = $teacher->subjects()
                    ->join('class_subjects', 'subjects.id', '=', 'class_subjects.subject_id')
                    ->pluck('class_subjects.school_class_id')
                    ->filter()
                    ->unique();

                $allowedClassIds = $teacher->homeroomClasses()->pluck('id')
                    ->merge($subjectClassIds)
                    ->unique()
                    ->values()
                    ->toArray();

                $classId = $this->input('classId');
                if ($classId !== null && ! in_array((int) $classId, $allowedClassIds)) {
                    $validator->errors()->add('classId', 'Anda tidak memiliki akses ke kelas yang dipilih.');
                }

                $allowedSubjectIds = $teacher->subjects()->pluck('id')->toArray();

                $subjectId = $this->input('subjectId');
                if ($subjectId !== null && ! in_array((int) $subjectId, $allowedSubjectIds)) {
                    $validator->errors()->add('subjectId', 'Anda tidak memiliki akses ke mata pelajaran yang dipilih.');
                }
            },
        ];
    }
}
