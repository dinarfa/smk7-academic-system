<?php

namespace App\Policies;

use App\Models\AttendanceSession;
use App\Models\User;

class AttendancePolicy
{
    /**
     * Determine whether the user can close the attendance session.
     */
    public function close(User $user, AttendanceSession $session): bool
    {
        return $user->isTeacher() && $session->opened_by === $user->id;
    }

    /**
     * Determine whether the user can view daily attendance.
     */
    public function viewDaily(User $user): bool
    {
        return $user->role === 'teacher';
    }

    /**
     * Determine whether the user can create manual attendance.
     */
    public function createManual(User $user): bool
    {
        return $user->role === 'teacher';
    }
}
