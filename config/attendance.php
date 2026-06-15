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

    /*
    |--------------------------------------------------------------------------
    | QR Token Rotation Interval
    |--------------------------------------------------------------------------
    |
    | Seconds before the QR token expires and a new one is generated.
    | Example: qr_rotation_seconds = 120 means the QR refreshes every 2 minutes.
    |
    */
    'qr_rotation_seconds' => (int) env('ATTENDANCE_QR_ROTATION_SECONDS', 30),

    /*
    |--------------------------------------------------------------------------
    | Schedule-Based Bolos Detection Time
    |--------------------------------------------------------------------------
    |
    | Time of day to run the schedule-based bolos detection.
    | After this time, students with scheduled subjects but no attendance
    | session opened will be automatically marked as bolos.
    | Format: HH:MM (24-hour). Default: 15:00 (3 PM).
    |
    */
    'schedule_bolos_time' => env('ATTENDANCE_SCHEDULE_BOLOS_TIME', '15:00'),
];
