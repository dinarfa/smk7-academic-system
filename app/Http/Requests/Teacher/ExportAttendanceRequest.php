<?php

namespace App\Http\Requests\Teacher;

use App\Helpers\SemesterHelper;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

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
            'semester' => ['required', 'string', 'regex:/^\d{4}\/\d{4}-[12]$/'],
            'format' => ['nullable', 'string', 'in:csv,xlsx'],
            'classId' => ['nullable', 'integer'],
            'subjectId' => ['nullable', 'integer'],
        ];
    }

    /**
     * Get the semester date range.
     *
     * @return array{startDate: string, endDate: string}
     */
    public function getSemesterDateRange(): array
    {
        return SemesterHelper::getDateRange($this->input('semester'));
    }

    /**
     * Get the effective start date from semester.
     */
    public function getEffectiveStartDate(): string
    {
        return $this->getSemesterDateRange()['startDate'];
    }

    /**
     * Get the effective end date from semester.
     */
    public function getEffectiveEndDate(): string
    {
        return $this->getSemesterDateRange()['endDate'];
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
                if (SemesterHelper::getDateRange($this->input('semester')) === null) {
                    $validator->errors()->add('semester', 'Semester tidak valid.');
                }
                $teacher = auth()->user();

                $subjectClassIds = $teacher->teachingSubjects()
                    ->pluck('class_subjects.school_class_id')
                    ->filter()
                    ->unique();

                // Also include classes where teacher is assigned via pivot
                $pivotClassIds = DB::table('class_subjects')
                    ->where('teacher_id', $teacher->id)
                    ->pluck('school_class_id');

                $allowedClassIds = $teacher->homeroomClasses()->pluck('id')
                    ->merge($subjectClassIds)
                    ->merge($pivotClassIds)
                    ->unique()
                    ->values()
                    ->toArray();

                $classId = $this->input('classId');
                if ($classId !== null && ! in_array((int) $classId, $allowedClassIds)) {
                    $validator->errors()->add('classId', 'Anda tidak memiliki akses ke kelas yang dipilih.');
                }

                $allowedSubjectIds = $teacher->teachingSubjects()->pluck('subjects.id')->toArray();

                $subjectId = $this->input('subjectId');
                if ($subjectId !== null && ! in_array((int) $subjectId, $allowedSubjectIds)) {
                    $validator->errors()->add('subjectId', 'Anda tidak memiliki akses ke mata pelajaran yang dipilih.');
                }
            },
        ];
    }
}
