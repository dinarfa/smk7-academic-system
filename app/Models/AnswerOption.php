<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['question_id', 'option_text', 'option_images', 'has_image', 'is_correct', 'sort_order'])]
class AnswerOption extends Model
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
            'is_correct' => 'boolean',
            'sort_order' => 'integer',
            'option_images' => 'array',
            'has_image' => 'boolean',
        ];
    }

    /**
     * Parent question.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
