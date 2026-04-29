<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['exam_id', 'prompt', 'type', 'points', 'sort_order', 'explanation'])]
class Question extends Model
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
            'points' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Exam containing this question.
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Answer options for objective questions.
     */
    public function answerOptions(): HasMany
    {
        return $this->hasMany(AnswerOption::class)->orderBy('sort_order');
    }

    /**
     * Responses submitted for this question.
     */
    public function responses(): HasMany
    {
        return $this->hasMany(ExamResponse::class);
    }
}
