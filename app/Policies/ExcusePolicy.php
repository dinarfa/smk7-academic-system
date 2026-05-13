<?php

namespace App\Policies;

use App\Models\Excuse;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ExcusePolicy
{
    /**
     * Determine whether the user can view any models (for teachers reviewing).
     */
    public function viewAny(User $user): bool
    {
        return $user->isTeacher() || $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Excuse $excuse): bool
    {
        // Student can view their own excuses
        if ($user->isStudent() && $user->id === $excuse->student_id) {
            return true;
        }

        // Teacher can view excuses for students in their classes
        if ($user->isTeacher()) {
            return $user->homeroomClasses()
                ->whereHas('students', function ($q) use ($excuse) {
                    $q->where('users.id', $excuse->student_id);
                })
                ->exists();
        }

        // Admin can view all
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isStudent();
    }

    /**
     * Determine whether the user can update the model (for review/approval).
     */
    public function update(User $user, Excuse $excuse): bool
    {
        // Only teacher or admin can approve/reject excuses
        if (!($user->isTeacher() || $user->isAdmin())) {
            return false;
        }

        // Teacher can only review excuses for their class students
        if ($user->isTeacher()) {
            return $user->homeroomClasses()
                ->whereHas('students', function ($q) use ($excuse) {
                    $q->where('users.id', $excuse->student_id);
                })
                ->exists();
        }

        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Excuse $excuse): bool
    {
        // Only the student who submitted can delete pending excuses
        if ($user->id === $excuse->student_id && $excuse->status === 'pending') {
            return true;
        }

        // Admin can delete any
        return $user->isAdmin();
    }


    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Excuse $excuse): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Excuse $excuse): bool
    {
        return false;
    }
}
