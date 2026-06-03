<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Grace Period for Late Detection
    |--------------------------------------------------------------------------
    |
    | Minutes after session starts_at before a student is considered late.
    | Example: grace_period_minutes = 10 means scanning at minute 11+ = Late.
    |
    */
    'grace_period_minutes' => (int) env('ATTENDANCE_GRACE_PERIOD', 10),

    /*
    |--------------------------------------------------------------------------
    | Bolos Detection Time
    |--------------------------------------------------------------------------
    |
    | Time of day to run the automatic bolos detection as a safety net.
    | Format: HH:MM (24-hour). Default: 15:00 (3 PM).
    |
    */
    'bolos_detection_time' => env('BOLOS_DETECTION_TIME', '15:00'),
];
