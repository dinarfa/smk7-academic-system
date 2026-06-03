<?php

use App\Enums\AttendanceQrType;
use App\Enums\AttendanceStatus;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\SchoolClass;
use App\Models\User;
use App\Services\Attendance\AbsenceDetectionService;
use App\Services\Attendance\AttendanceSessionLifecycleService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('detectForSessions creates bolos records for missing students', function () {
    $teacher = User::factory()->teacher()->create();
    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $studentPresent = User::factory()->student()->create(['school_class_id' => $schoolClass->id]);
    $studentMissing = User::factory()->student()->create(['school_class_id' => $schoolClass->id]);

    $session = AttendanceSession::factory()->create([
        'opened_by' => $teacher->id,
        'type' => AttendanceQrType::Subject->value,
        'starts_at' => now()->subHour(),
        'ends_at' => now()->subMinute(),
        'is_active' => false,
    ]);

    AttendanceRecord::factory()->create([
        'attendance_session_id' => $session->id,
        'student_id' => $studentPresent->id,
        'status' => AttendanceStatus::Present->value,
    ]);

    $service = app(AbsenceDetectionService::class);
    $created = $service->detectForSessions(collect([$session]));

    expect($created)->toBe(1);

    $this->assertDatabaseHas('attendance_records', [
        'attendance_session_id' => $session->id,
        'student_id' => $studentMissing->id,
        'status' => AttendanceStatus::Bolos->value,
        'source' => 'system',
    ]);
});

test('detectForSessions skips students who already have records', function () {
    $teacher = User::factory()->teacher()->create();
    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $student = User::factory()->student()->create(['school_class_id' => $schoolClass->id]);

    $session = AttendanceSession::factory()->create([
        'opened_by' => $teacher->id,
        'type' => AttendanceQrType::Morning->value,
        'is_active' => false,
    ]);

    AttendanceRecord::factory()->create([
        'attendance_session_id' => $session->id,
        'student_id' => $student->id,
        'status' => AttendanceStatus::Present->value,
    ]);

    $service = app(AbsenceDetectionService::class);
    $created = $service->detectForSessions(collect([$session]));

    expect($created)->toBe(0);
});

test('closeExpiredSessions triggers bolos detection', function () {
    $teacher = User::factory()->teacher()->create();
    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $student = User::factory()->student()->create(['school_class_id' => $schoolClass->id]);

    AttendanceSession::factory()->create([
        'opened_by' => $teacher->id,
        'type' => AttendanceQrType::Subject->value,
        'starts_at' => now()->subHours(2),
        'ends_at' => now()->subHour(),
        'is_active' => true,
    ]);

    $lifecycle = app(AttendanceSessionLifecycleService::class);
    $closed = $lifecycle->closeExpiredSessions();

    expect($closed)->toBe(1);

    $this->assertDatabaseHas('attendance_records', [
        'student_id' => $student->id,
        'status' => AttendanceStatus::Bolos->value,
        'source' => 'system',
    ]);
});

test('detect-missed command runs successfully', function () {
    $this->artisan('attendance:detect-missed')
        ->assertExitCode(0);
});
