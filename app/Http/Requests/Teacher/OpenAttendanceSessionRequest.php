<?php

namespace App\Http\Requests\Teacher;

use App\Models\SchoolClass;
use App\Models\Subject;
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
        return auth()->check() && auth()->user()->isTeacher();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teacherId = $this->user()?->id;

        return [
            'subject_key' => [
                'nullable',
                'string',
                Rule::in($this->allowedSubjectKeys()),
            ],
            'class_id' => [
                'required',
                'integer',
                'exists:school_classes,id',
                function (string $attribute, mixed $value, \Closure $fail) use ($teacherId): void {
                    $subjectKey = $this->input('subject_key');

                    // If teacher selected a specific subject, ensure it belongs to them and the class
                    if (is_string($subjectKey) && str_contains($subjectKey, '::')) {
                        [$subjectCode, $subjectName] = explode('::', $subjectKey, 2);

                        $subjectQuery = Subject::query()
                            ->where('teacher_id', $teacherId)
                            ->where('name', $subjectName)
                            ->whereHas('schoolClasses', fn ($q) => $q->where('school_classes.id', (int) $value));

                        if ($subjectCode === '') {
                            $subjectQuery->whereNull('code');
                        } else {
                            $subjectQuery->where('code', $subjectCode);
                        }

                        $isAllowed = $subjectQuery->exists();

                        if (! $isAllowed) {
                            $fail('Kelas yang dipilih tidak termasuk relasi mata pelajaran Anda.');
                        }

                        return;
                    }

                    // No specific subject chosen. Allow if teacher is homeroom or teaches in that class.
                    // Check both pivot teacher_id and subject.teacher_id (default)
                    $teachesInClass = Subject::query()
                        ->where(function ($q) use ($teacherId, $value): void {
                            $q->where('teacher_id', $teacherId)
                                ->whereHas('schoolClasses', fn ($q2) => $q2->where('school_classes.id', (int) $value));
                        })
                        ->orWhereHas('schoolClasses', function ($q) use ($teacherId, $value): void {
                            $q->where('school_classes.id', (int) $value)
                                ->where('class_subjects.teacher_id', $teacherId);
                        })
                        ->exists();

                    if ($teachesInClass) {
                        return;
                    }

                    // Allow if teacher is homeroom teacher for the class
                    $isHomeroom = SchoolClass::query()
                        ->where('id', (int) $value)
                        ->where('homeroom_teacher_id', $teacherId)
                        ->exists();

                    if ($isHomeroom) {
                        return;
                    }

                    $fail('Anda tidak memiliki akses ke kelas yang dipilih.');
                },
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    private function allowedSubjectKeys(): array
    {
        $teacherId = $this->user()?->id;

        if (! $teacherId) {
            return [];
        }

        // Subjects where teacher is the default teacher
        $defaultSubjects = Subject::query()
            ->where('teacher_id', $teacherId)
            ->get(['id', 'code', 'name']);

        // Subjects assigned to this teacher via the class_subjects pivot
        $pivotSubjects = Subject::query()
            ->whereHas('schoolClasses', fn ($q) => $q->where('class_subjects.teacher_id', $teacherId))
            ->get(['id', 'code', 'name']);

        return $defaultSubjects
            ->merge($pivotSubjects)
            ->unique('id')
            ->map(fn (Subject $subject): string => $subject->code.'::'.$subject->name)
            ->unique()
            ->values()
            ->all();
    }
}
