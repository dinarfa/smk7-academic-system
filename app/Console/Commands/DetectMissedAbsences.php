<?php

namespace App\Console\Commands;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Services\Attendance\AbsenceDetectionService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DetectMissedAbsences extends Command
{
    protected $signature = 'attendance:detect-missed {--days=2 : Number of past days to check}';

    protected $description = 'Detect bolos for past days that may have been missed (e.g., after server downtime)';

    public function handle(AbsenceDetectionService $service): int
    {
        $days = (int) $this->option('days');
        $totalCreated = 0;

        for ($i = 1; $i <= $days; $i++) {
            $date = now()->subDays($i)->format('Y-m-d');

            $hasSessions = AttendanceSession::query()
                ->whereDate('starts_at', $date)
                ->where('is_active', false)
                ->exists();

            if (! $hasSessions) {
                $this->line("{$date}: No closed sessions found, skipping.");

                continue;
            }

            $result = $service->detectForDate($date);
            $created = $result['created'];
            $totalCreated += $created;

            $this->info("{$date}: {$created} bolos records created.");
        }

        $this->newLine();
        $this->info("Done. Total bolos records created: {$totalCreated}.");

        return self::SUCCESS;
    }
}
