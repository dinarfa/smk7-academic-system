<?php

namespace App\Policies;

use App\Models\AttendanceSession;
use App\Models\User;

class AttendanceSessionPolicy
{
    /**
     * Determine whether the user can update the attendance session.
     */
    public function update(User $user, AttendanceSession $attendanceSession): bool
    {
        return $attendanceSession->opened_by === $user->id;
    }

    /**
     * Determine whether the user can close the attendance session.
     */
    public function close(User $user, AttendanceSession $attendanceSession): bool
    {
        return $this->update($user, $attendanceSession);
    }
}
