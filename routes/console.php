<?php

use App\Jobs\DetectAbsencesJob;
use App\Services\Attendance\AbsenceDetectionService;
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

Schedule::command('attendance:close-expired-sessions')->everyMinute();
