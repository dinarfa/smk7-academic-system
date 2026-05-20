<?php

use App\Enums\AttendanceQrType;
use App\Enums\AttendanceStatus;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\SchoolClass;
use App\Models\User;
use App\Services\Attendance\AbsenceDetectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('absence detection creates bolos records for missing student scans', function () {
    $teacher = User::factory()->teacher()->create();
    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $studentPresent = User::factory()->student()->create(['school_class_id' => $schoolClass->id]);
    $studentMissing = User::factory()->student()->create(['school_class_id' => $schoolClass->id]);

    $session = AttendanceSession::factory()->create([
        'opened_by' => $teacher->id,
        'type' => AttendanceQrType::Subject->value,
        'starts_at' => now()->startOfDay()->addHours(7),
        'ends_at' => now()->startOfDay()->addHours(8),
        'is_active' => false,
    ]);

    AttendanceRecord::factory()->create([
        'attendance_session_id' => $session->id,
        'student_id' => $studentPresent->id,
        'status' => AttendanceStatus::Present->value,
    ]);

    $service = app(AbsenceDetectionService::class);
    $summary = $service->detectForTeacherOnDate($teacher->id, today()->format('Y-m-d'));

    expect($summary['created'])->toBe(1);
    $this->assertDatabaseHas('attendance_records', [
        'attendance_session_id' => $session->id,
        'student_id' => $studentMissing->id,
        'status' => AttendanceStatus::Bolos->value,
        'phase' => AttendanceQrType::ClassPhase->value,
        'source' => 'system',
    ]);
});

test('absence detection command dispatches and returns success', function () {
    $teacher = User::factory()->teacher()->create();
    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    User::factory()->student()->create(['school_class_id' => $schoolClass->id]);

    $this->artisan('attendance:detect-absences', ['date' => today()->format('Y-m-d')])
        ->assertExitCode(0);
});

test('teacher can access bolos summary endpoint', function () {
    $teacher = User::factory()->teacher()->create();
    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $student = User::factory()->student()->create(['school_class_id' => $schoolClass->id]);

    $session = AttendanceSession::factory()->create([
        'opened_by' => $teacher->id,
        'type' => AttendanceQrType::Morning->value,
        'starts_at' => now()->startOfDay()->addHours(7),
        'ends_at' => now()->startOfDay()->addHours(8),
    ]);

    $summary = app(AbsenceDetectionService::class)
        ->summaryForTeacherOnDate($teacher->id, today()->format('Y-m-d'));

    expect($summary['missing_count'])->toBe(1);

    $this->actingAs($teacher)
        ->get(route('teacher.attendance.bolos-summary', ['date' => today()->format('Y-m-d')]))
        ->assertOk()
        ->assertJsonPath('summary.missing_count', 1);
});
