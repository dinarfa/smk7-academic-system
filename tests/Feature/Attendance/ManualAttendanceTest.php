<?php

use App\Enums\AttendanceQrType;
use App\Models\AttendanceSession;
use App\Models\User;

test('teacher can create manual attendance', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);
    $session = AttendanceSession::factory()->create(['opened_by' => $teacher->id]);

    $this->actingAs($teacher);

    $response = $this->post(route('teacher.attendance.manual'), [
        'session_id' => $session->id,
        'phase' => AttendanceQrType::Morning->value,
        'students' => [
            ['student_id' => $student->id, 'status' => 'present'],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendance_records', [
        'attendance_session_id' => $session->id,
        'student_id' => $student->id,
        'status' => 'present',
        'phase' => AttendanceQrType::Morning->value,
        'source' => 'manual',
    ]);
});

test('student cannot create manual attendance', function () {
    $student = User::factory()->create(['role' => 'student']);
    $teacher = User::factory()->create(['role' => 'teacher']);
    $session = AttendanceSession::factory()->create(['opened_by' => $teacher->id]);

    $this->actingAs($student);

    $response = $this->post(route('teacher.attendance.manual'), [
        'session_id' => $session->id,
        'phase' => AttendanceQrType::Morning->value,
        'students' => [
            ['student_id' => $student->id, 'status' => 'present'],
        ],
    ]);

    $response->assertForbidden();
});

test('manual attendance requires valid session', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);

    $this->actingAs($teacher);

    $response = $this->post(route('teacher.attendance.manual'), [
        'session_id' => 999, // Non-existent session
        'phase' => AttendanceQrType::Morning->value,
        'students' => [
            ['student_id' => $student->id, 'status' => 'present'],
        ],
    ]);

    $response->assertSessionHasErrors('session_id');
});

test('manual attendance validates student status', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);
    $session = AttendanceSession::factory()->create(['opened_by' => $teacher->id]);

    $this->actingAs($teacher);

    $response = $this->post(route('teacher.attendance.manual'), [
        'session_id' => $session->id,
        'phase' => AttendanceQrType::Morning->value,
        'students' => [
            ['student_id' => $student->id, 'status' => 'invalid_status'],
        ],
    ]);

    $response->assertSessionHasErrors('students.0.status');
});
