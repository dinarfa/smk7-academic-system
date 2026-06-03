<?php

use App\Jobs\DetectAbsencesJob;
use App\Services\Attendance\AbsenceDetectionService;
use App\Services\Attendance\AttendanceSessionLifecycleService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('attendance:detect-absences {date?}', function (?string $date = null) {
    $targetDate = $date ?? today()->format('Y-m-d');
    $job = new DetectAbsencesJob($targetDate);
    $result = $job->handle(app(AbsenceDetectionService::class));

    $this->info("Attendance detection completed for {$result['date']}.");
    $this->info("Records created: {$result['created']}.");
})->purpose('Detect missing attendance and mark bolos records for teacher sessions.');

Schedule::call(function () {
    app(AttendanceSessionLifecycleService::class)->closeExpiredSessions();
})->everyFiveMinutes();

// Safety net: run bolos detection at end of school day
Schedule::command('attendance:detect-absences')->dailyAt(config('attendance.bolos_detection_time', '15:00'));

// Retroactive: check past 2 days for missed detections (e.g., after server downtime)
Schedule::command('attendance:detect-missed --days=2')->dailyAt('07:00');
