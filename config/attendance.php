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
];
