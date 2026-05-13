<?php

use App\Enums\AttendanceQrType;
use App\Enums\AttendanceStatus;
use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

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

test('attendance types and statuses are cast to enums', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();

    $session = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'subject',
        'subject' => 'Matematika',
        'qr_token' => 'ENUM-TOKEN-001',
        'starts_at' => now(),
        'ends_at' => now()->addMinutes(30),
        'is_active' => true,
    ]);

    $record = AttendanceRecord::query()->create([
        'attendance_session_id' => $session->id,
        'student_id' => $student->id,
        'status' => 'present',
        'scanned_at' => now(),
    ]);

    expect($session->type)->toBe(AttendanceQrType::Subject);
    expect($record->status)->toBe(AttendanceStatus::Present);
});

test('teacher can only close their own attendance session', function () {
    $owner = User::factory()->teacher()->create();
    $otherTeacher = User::factory()->teacher()->create();

    $session = AttendanceSession::query()->create([
        'opened_by' => $owner->id,
        'type' => 'morning',
        'qr_token' => 'SESSION-TOKEN-OWNER',
        'starts_at' => now()->subMinutes(5),
        'ends_at' => now()->addMinutes(20),
        'is_active' => true,
    ]);

    $this->actingAs($otherTeacher)
        ->patch(route('teacher.attendance-sessions.close', $session))
        ->assertForbidden();

    $this->assertDatabaseHas('attendance_sessions', [
        'id' => $session->id,
        'is_active' => 1,
    ]);

    $this->actingAs($owner)
        ->patch(route('teacher.attendance-sessions.close', $session))
        ->assertRedirect();

    $this->assertDatabaseHas('attendance_sessions', [
        'id' => $session->id,
        'is_active' => 0,
    ]);
});

test('student cannot close a teacher attendance session', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();

    $session = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'morning',
        'qr_token' => 'SESSION-TOKEN-STUDENT-BLOCKED',
        'starts_at' => now()->subMinutes(5),
        'ends_at' => now()->addMinutes(20),
        'is_active' => true,
    ]);

    $this->actingAs($student)
        ->patch(route('teacher.attendance-sessions.close', $session))
        ->assertForbidden();

    $this->assertDatabaseHas('attendance_sessions', [
        'id' => $session->id,
        'is_active' => 1,
    ]);
});

test('teacher opening a session only closes their own active sessions', function () {
    $teacher = User::factory()->teacher()->create();
    $otherTeacher = User::factory()->teacher()->create();

    $ownActiveSession = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'morning',
        'qr_token' => 'OWN-ACTIVE-001',
        'starts_at' => now()->subMinutes(10),
        'ends_at' => now()->addMinutes(20),
        'is_active' => true,
    ]);

    $otherActiveSession = AttendanceSession::query()->create([
        'opened_by' => $otherTeacher->id,
        'type' => 'morning',
        'qr_token' => 'OTHER-ACTIVE-001',
        'starts_at' => now()->subMinutes(10),
        'ends_at' => now()->addMinutes(20),
        'is_active' => true,
    ]);

    $this->actingAs($teacher)->post(route('teacher.attendance-sessions.store'), [
        'type' => 'morning',
        'duration_minutes' => 45,
    ])->assertRedirect();

    $this->assertDatabaseHas('attendance_sessions', [
        'id' => $ownActiveSession->id,
        'is_active' => 0,
    ]);

    $this->assertDatabaseHas('attendance_sessions', [
        'id' => $otherActiveSession->id,
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

test('student can open the dedicated attendance scanner page', function () {
    $student = User::factory()->student()->create();

    $this->actingAs($student)
        ->get(route('student.attendance.scan.page'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('student/attendance/scan'));
});

test('teacher can open the dedicated qr attendance page', function () {
    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->get(route('teacher.attendance.qr'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('teacher/attendance/qr'));
});

test('teacher can open the dedicated daily attendance page', function () {
    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->get(route('teacher.attendance.daily'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('teacher/attendance/daily'));
});

test('duplicate scans do not create duplicate attendance records', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();

    $session = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'subject',
        'subject' => 'Matematika',
        'qr_token' => 'CONCURRENCY-TOKEN-001',
        'starts_at' => now()->subMinutes(5),
        'ends_at' => now()->addMinutes(20),
        'is_active' => true,
    ]);

    $payload = ['qr_token' => 'attendance:CONCURRENCY-TOKEN-001'];

    $this->actingAs($student)
        ->post(route('student.attendance.scan'), $payload)
        ->assertRedirect();

    $this->actingAs($student)
        ->post(route('student.attendance.scan'), $payload)
        ->assertRedirect();

    expect(AttendanceRecord::query()
        ->where('attendance_session_id', $session->id)
        ->where('student_id', $student->id)
        ->count())->toBe(1);
});

test('teacher can create update and delete student data', function () {
    $teacher = User::factory()->teacher()->create();
    SchoolClass::factory()->create([
        'homeroom_teacher_id' => $teacher->id,
    ]);

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

test('teacher can save manual attendance for students in their class', function () {
    $teacher = User::factory()->teacher()->create();
    $class = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $student1 = User::factory()->student()->create(['school_class_id' => $class->id]);
    $student2 = User::factory()->student()->create(['school_class_id' => $class->id]);

    $session = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'morning',
        'qr_token' => 'MANUAL-SESSION-001',
        'starts_at' => now(),
        'ends_at' => now()->addMinutes(30),
        'is_active' => true,
    ]);

    $response = $this->actingAs($teacher)->post(route('teacher.attendance.manual'), [
        'session_id' => $session->id,
        'phase' => 'morning',
        'students' => [
            ['student_id' => $student1->id, 'status' => 'present'],
            ['student_id' => $student2->id, 'status' => 'late'],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendance_records', [
        'attendance_session_id' => $session->id,
        'student_id' => $student1->id,
        'status' => 'present',
        'source' => 'manual',
    ]);
    $this->assertDatabaseHas('attendance_records', [
        'attendance_session_id' => $session->id,
        'student_id' => $student2->id,
        'status' => 'late',
        'source' => 'manual',
    ]);
});

test('teacher cannot save manual attendance for students not in their class', function () {
    $teacher = User::factory()->teacher()->create();
    $otherTeacher = User::factory()->teacher()->create();
    $class = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $otherClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $otherTeacher->id]);
    $studentInClass = User::factory()->student()->create(['school_class_id' => $class->id]);
    $studentNotInClass = User::factory()->student()->create(['school_class_id' => $otherClass->id]);

    $session = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'morning',
        'qr_token' => 'MANUAL-SESSION-002',
        'starts_at' => now(),
        'ends_at' => now()->addMinutes(30),
        'is_active' => true,
    ]);

    $response = $this->actingAs($teacher)->post(route('teacher.attendance.manual'), [
        'session_id' => $session->id,
        'phase' => 'morning',
        'students' => [
            ['student_id' => $studentInClass->id, 'status' => 'present'],
            ['student_id' => $studentNotInClass->id, 'status' => 'absent'],
        ],
    ]);

    $response->assertSessionHasErrors();
    $this->assertDatabaseMissing('attendance_records', [
        'attendance_session_id' => $session->id,
        'student_id' => $studentNotInClass->id,
    ]);
});

test('teacher can fetch class students for manual attendance', function () {
    $teacher = User::factory()->teacher()->create();
    $class = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $student1 = User::factory()->student()->create(['school_class_id' => $class->id, 'name' => 'Alice']);
    $student2 = User::factory()->student()->create(['school_class_id' => $class->id, 'name' => 'Bob']);

    $response = $this->actingAs($teacher)->get(route('teacher.class-students'));

    $response->assertStatus(200);
    $data = $response->json();
    expect($data['students'])->toHaveCount(2);
    expect($data['students'][0])->toHaveKeys(['id', 'name']);
});

test('teacher without assigned classes can save manual attendance', function () {
    $teacher = User::factory()->teacher()->create();

    $session = AttendanceSession::query()->create([
        'opened_by' => $teacher->id,
        'type' => 'morning',
        'qr_token' => 'MANUAL-SESSION-003',
        'starts_at' => now(),
        'ends_at' => now()->addMinutes(30),
        'is_active' => true,
    ]);

    $student = User::factory()->student()->create();

    $response = $this->actingAs($teacher)->post(route('teacher.attendance.manual'), [
        'session_id' => $session->id,
        'phase' => 'morning',
        'students' => [
            ['student_id' => $student->id, 'status' => 'present'],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendance_records', [
        'attendance_session_id' => $session->id,
        'student_id' => $student->id,
        'status' => 'present',
        'source' => 'manual',
    ]);
});
