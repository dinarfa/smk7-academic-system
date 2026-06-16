<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['exam_id', 'student_id', 'started_at', 'submitted_at', 'status', 'score', 'graded_at', 'graded_by', 'feedback'])]
class ExamAttempt extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'score' => 'decimal:2',
            'graded_at' => 'datetime',
        ];
    }

    /**
     * Exam being attempted.
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Student taking this attempt.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Guru yang mengoreksi attempt ini.
     */
    public function gradedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    /**
     * Responses submitted in this attempt.
     */
    public function responses(): HasMany
    {
        return $this->hasMany(ExamResponse::class);
    }
}
