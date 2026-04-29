<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name'])]
class Subject extends Model
{
    use HasFactory;

    /**
     * Exams created under this subject.
     */
    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class)->latest();
    }
}
