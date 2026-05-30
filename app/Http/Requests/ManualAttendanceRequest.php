<?php

namespace App\Http\Requests;

use App\Models\SchoolClass;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

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
            'class_id' => ['required', 'integer', 'exists:school_classes,id'],
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
            'class_id.required' => 'Pilih kelas terlebih dahulu.',
            'students.required' => 'Pilih minimal 1 siswa.',
            'students.*.student_id.exists' => 'Siswa tidak ditemukan.',
            'students.*.status.in' => 'Status harus present, late, atau absent.',
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
                $classId = $this->input('class_id');

                if (! $classId) {
                    return;
                }

                // Check teacher has access to this class
                $hasAccess = SchoolClass::query()
                    ->where('id', $classId)
                    ->where(function ($q) use ($teacher): void {
                        $q->where('homeroom_teacher_id', $teacher->id)
                            ->orWhereExists(function ($sub) use ($teacher): void {
                                $sub->select(\Illuminate\Support\Facades\DB::raw(1))
                                    ->from('class_subjects')
                                    ->whereColumn('class_subjects.school_class_id', 'school_classes.id')
                                    ->where('class_subjects.teacher_id', $teacher->id);
                            });
                    })
                    ->exists();

                if (! $hasAccess) {
                    $validator->errors()->add('class_id', 'Anda tidak memiliki akses ke kelas yang dipilih.');

                    return;
                }

                // Check all students belong to the selected class
                $studentIds = collect($this->input('students', []))
                    ->pluck('student_id')
                    ->filter()
                    ->unique()
                    ->values()
                    ->toArray();

                if (empty($studentIds)) {
                    return;
                }

                $studentsInClass = \App\Models\User::query()
                    ->whereIn('id', $studentIds)
                    ->where('school_class_id', $classId)
                    ->pluck('id')
                    ->toArray();

                $invalidStudents = array_diff($studentIds, $studentsInClass);
                if (! empty($invalidStudents)) {
                    $validator->errors()->add(
                        'students',
                        'Beberapa siswa tidak termasuk dalam kelas yang dipilih.',
                    );
                }
            },
        ];
    }
}
