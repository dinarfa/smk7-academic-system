<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['homeroom_teacher_id', 'name', 'code', 'academic_year'])]
class SchoolClass extends Model
{
    use HasFactory;

    /**
     * Teacher assigned as the homeroom teacher.
     */
    public function homeroomTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'homeroom_teacher_id');
    }

    /**
     * Students assigned to this class.
     */
    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'school_class_id');
    }

    /**
     * Subjects taught in this class.
     */
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'class_subjects')
            ->withPivot('teacher_id')
            ->withTimestamps();
    }

    /**
     * Exams for this class.
     */
    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }
}
