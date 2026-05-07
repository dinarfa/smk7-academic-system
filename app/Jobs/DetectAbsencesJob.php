<?php

namespace App\Jobs;

use App\Services\Attendance\AbsenceDetectionService;

class DetectAbsencesJob
{
    public function __construct(
        public string $date,
    ) {
    }

    public function handle(AbsenceDetectionService $service): array
    {
        return $service->detectForDate($this->date);
    }
}
