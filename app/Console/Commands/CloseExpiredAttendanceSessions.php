<?php

namespace App\Console\Commands;

use App\Services\Attendance\AttendanceSessionLifecycleService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('attendance:close-expired-sessions')]
#[Description('Close expired attendance QR sessions')]
class CloseExpiredAttendanceSessions extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(AttendanceSessionLifecycleService $attendanceSessionLifecycleService): int
    {
        $closedCount = $attendanceSessionLifecycleService->closeExpiredSessions();

        $this->info("Closed {$closedCount} expired attendance session(s).");

        return self::SUCCESS;
    }
}
