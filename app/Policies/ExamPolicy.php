<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    /**
     * Determine whether the user can view the exam.
     */
    public function view(User $user, Exam $exam): bool
    {
        return $user->id === $exam->created_by;
    }

    /**
     * Determine whether the user can create exams.
     */
    public function create(User $user): bool
    {
        return $user->role === 'teacher';
    }

    /**
     * Determine whether the user can update the exam.
     */
    public function update(User $user, Exam $exam): bool
    {
        return $user->id === $exam->created_by;
    }

    /**
     * Determine whether the user can delete the exam.
     */
    public function delete(User $user, Exam $exam): bool
    {
        return $user->id === $exam->created_by;
    }
}
