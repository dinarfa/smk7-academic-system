<?php

use App\Enums\UserRole;
use App\Models\AttendanceSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('teacher can open a new attendance qr session', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->post(route('teacher.attendance-sessions.store'), [
        'type' => 'morning',
        'duration_minutes' => 45,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendance_sessions', [
        'opened_by' => $teacher->id,
        'type' => 'morning',
        'is_active' => 1,
    ]);
});

test('student can scan active qr token and record attendance', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();

    $session = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'subject',
        'subject' => 'Matematika',
        'qr_token' => 'SESSION-TOKEN-001',
        'starts_at' => now()->subMinutes(5),
        'ends_at' => now()->addMinutes(20),
        'is_active' => true,
    ]);

    $response = $this->actingAs($student)->post(route('student.attendance.scan'), [
        'qr_token' => 'attendance:SESSION-TOKEN-001',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendance_records', [
        'attendance_session_id' => $session->id,
        'student_id' => $student->id,
        'status' => 'present',
    ]);
});

test('teacher can create update and delete student data', function () {
    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)->post(route('teacher.students.store'), [
        'name' => 'Budi',
        'email' => 'budi@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect();

    $student = User::query()->where('email', 'budi@example.com')->firstOrFail();

    expect($student->role)->toBe(UserRole::Student);

    $this->actingAs($teacher)->put(route('teacher.students.update', $student), [
        'name' => 'Budi Santoso',
        'email' => 'budi.santoso@example.com',
    ])->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $student->id,
        'name' => 'Budi Santoso',
        'email' => 'budi.santoso@example.com',
    ]);

    $this->actingAs($teacher)->delete(route('teacher.students.destroy', $student))
        ->assertRedirect();

    $this->assertDatabaseMissing('users', [
        'id' => $student->id,
    ]);
});

test('role middleware prevents cross-role area access', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();

    $this->actingAs($student)
        ->get(route('teacher.students.index'))
        ->assertForbidden();

    $this->actingAs($teacher)
        ->get(route('student.attendance.index'))
        ->assertForbidden();
});
