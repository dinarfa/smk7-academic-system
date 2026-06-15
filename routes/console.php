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

Artisan::command('attendance:detect-schedule-bolos {date?}', function (?string $date = null) {
    $service = app(AbsenceDetectionService::class);
    $result = $service->detectForSchedule($date);

    $this->info("Schedule-based bolos detection completed for {$result['date']}.");
    $this->info("Students checked: {$result['students_checked']}.");
    $this->info("Records created: {$result['records_created']}.");

    if (! empty($result['details'])) {
        $this->table(
            ['Kelas', 'Siswa Terdeteksi'],
            collect($result['details'])->map(fn ($d) => [
                $d['class'], $d['students_affected'],
            ]),
        );
    }
})->purpose('Detect bolos for students with no attendance records today.');

// Every 5 minutes: close expired sessions + auto-detect bolos after configured time
Schedule::call(function () {
    app(AttendanceSessionLifecycleService::class)->closeExpiredSessions();

    // Auto-detect bolos if current time >= configured threshold (once per day via cache)
    $bolosTime = config('attendance.schedule_bolos_time', '15:00');
    if (now()->gte(today()->setTimeFromTimeString($bolosTime))) {
        $cacheKey = 'bolos_schedule_'.today()->format('Y-m-d');
        if (! cache()->has($cacheKey)) {
            app(AbsenceDetectionService::class)->detectForSchedule();
            cache()->put($cacheKey, true, now()->addDay());
        }
    }
})->everyFiveMinutes();

// Safety net: run session-based bolos detection at end of school day
Schedule::command('attendance:detect-absences')->dailyAt(config('attendance.bolos_detection_time', '15:00'));

// Retroactive: check past 2 days for missed detections (e.g., after server downtime)
Schedule::command('attendance:detect-missed --days=2')->dailyAt('07:00');
