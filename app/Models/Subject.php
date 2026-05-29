<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'teacher_id'])]
class Subject extends Model
{
    use HasFactory;

    /**
     * The teacher who teaches this subject.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The classes this subject belongs to.
     */
    public function schoolClasses(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'class_subjects')
            ->withPivot('teacher_id')
            ->withTimestamps();
    }

    /**
     * Resolve the teacher for this subject in a specific class.
     * Pivot teacher_id takes precedence over the default subjects.teacher_id.
     */
    public function teacherForClass(int $classId): ?User
    {
        $pivotTeacherId = $this->schoolClasses()
            ->where('school_classes.id', $classId)
            ->first()?->pivot?->teacher_id;

        if ($pivotTeacherId) {
            return User::find($pivotTeacherId);
        }

        return $this->teacher;
    }

    /**
     * Exams created under this subject.
     */
    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class)->latest();
    }
}
