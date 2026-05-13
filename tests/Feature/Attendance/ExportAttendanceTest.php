<?php

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('teacher can export only their own attendance records within a date range', function () {
    $teacher = User::factory()->teacher()->create();
    $otherTeacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    $otherStudent = User::factory()->student()->create();

    $teacherSession = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'morning',
        'qr_token' => 'EXPORT-TOKEN-001',
        'starts_at' => now()->startOfDay()->addHours(7),
        'ends_at' => now()->startOfDay()->addHours(8),
        'is_active' => false,
    ]);

    $otherTeacherSession = AttendanceSession::query()->create([
        'opened_by' => $otherTeacher->id,
        'type' => 'morning',
        'qr_token' => 'EXPORT-TOKEN-002',
        'starts_at' => now()->startOfDay()->addHours(7),
        'ends_at' => now()->startOfDay()->addHours(8),
        'is_active' => false,
    ]);

    AttendanceRecord::query()->create([
        'attendance_session_id' => $teacherSession->id,
        'student_id' => $student->id,
        'status' => 'present',
        'phase' => 'morning',
        'source' => 'qr_scan',
        'excused' => false,
        'scanned_at' => now()->startOfDay()->addHours(7)->addMinutes(5),
    ]);

    AttendanceRecord::query()->create([
        'attendance_session_id' => $otherTeacherSession->id,
        'student_id' => $otherStudent->id,
        'status' => 'present',
        'phase' => 'morning',
        'source' => 'qr_scan',
        'excused' => false,
        'scanned_at' => now()->startOfDay()->addHours(7)->addMinutes(10),
    ]);

    $response = $this->actingAs($teacher)->post(route('teacher.attendance.export'), [
        'startDate' => now()->toDateString(),
        'endDate' => now()->toDateString(),
    ]);

    $response->assertOk();
    $response->assertDownload();
    expect($response->streamedContent())->toContain($student->name);
    expect($response->streamedContent())->toContain($student->email);
    expect($response->streamedContent())->not->toContain($otherStudent->name);
});

test('teacher can export attendance as xlsx', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();

    $session = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'morning',
        'qr_token' => 'EXPORT-XLSX-001',
        'starts_at' => now()->startOfDay()->addHours(7),
        'ends_at' => now()->startOfDay()->addHours(8),
        'is_active' => false,
    ]);

    AttendanceRecord::query()->create([
        'attendance_session_id' => $session->id,
        'student_id' => $student->id,
        'status' => 'present',
        'phase' => 'morning',
        'source' => 'qr_scan',
        'excused' => false,
        'scanned_at' => now()->startOfDay()->addHours(7)->addMinutes(5),
    ]);

    $response = $this->actingAs($teacher)->post(route('teacher.attendance.export'), [
        'startDate' => now()->toDateString(),
        'endDate' => now()->toDateString(),
        'format' => 'xlsx',
    ]);

    $response->assertOk();
    $response->assertDownload();
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});
