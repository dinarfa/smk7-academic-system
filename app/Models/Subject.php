<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'department_id'])]
class Subject extends Model
{
    use HasFactory;

    /**
     * Department this subject belongs to (null = general/umum).
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * The classes this subject belongs to (with teacher on pivot).
     */
    public function schoolClasses(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'class_subjects')
            ->withPivot('teacher_id')
            ->withTimestamps();
    }

    /**
     * Resolve the teacher for this subject in a specific class.
     */
    public function teacherForClass(int $classId): ?User
    {
        $pivotTeacherId = $this->schoolClasses()
            ->where('school_classes.id', $classId)
            ->first()?->pivot?->teacher_id;

        return $pivotTeacherId ? User::find($pivotTeacherId) : null;
    }

    /**
     * Exams created under this subject.
     */
    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class)->latest();
    }
}
