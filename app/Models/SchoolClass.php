<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

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
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    /**
     * Exams for this class.
     */
    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    /**
     * Exams available through the subjects in this class.
     */
    public function examsViaSubjects(): HasManyThrough
    {
        return $this->hasManyThrough(Exam::class, Subject::class);
    }
}
