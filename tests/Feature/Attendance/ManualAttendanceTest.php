<?php

use App\Models\SchoolClass;
use App\Models\SubjectSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('teacher can create manual attendance', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $class = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $student = User::factory()->create(['role' => 'student', 'school_class_id' => $class->id]);

    // Create an active schedule for this class
    SubjectSchedule::factory()->create([
        'school_class_id' => $class->id,
        'schedule_type' => 'morning',
        'day_of_week' => now()->dayOfWeek,
        'starts_at' => now()->subHour()->format('H:i'),
        'ends_at' => now()->addHour()->format('H:i'),
    ]);

    $this->actingAs($teacher);

    $response = $this->post(route('teacher.attendance.manual'), [
        'class_id' => $class->id,
        'students' => [
            ['student_id' => $student->id, 'status' => 'present'],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendance_records', [
        'student_id' => $student->id,
        'status' => 'present',
        'source' => 'manual',
    ]);
});

test('student cannot create manual attendance', function () {
    $student = User::factory()->create(['role' => 'student']);
    $class = SchoolClass::factory()->create();

    $this->actingAs($student);

    $response = $this->post(route('teacher.attendance.manual'), [
        'class_id' => $class->id,
        'students' => [
            ['student_id' => $student->id, 'status' => 'present'],
        ],
    ]);

    $response->assertForbidden();
});

test('manual attendance requires class_id', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);

    $this->actingAs($teacher);

    $response = $this->post(route('teacher.attendance.manual'), [
        'students' => [
            ['student_id' => $student->id, 'status' => 'present'],
        ],
    ]);

    $response->assertSessionHasErrors('class_id');
});

test('manual attendance validates student status', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $class = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $student = User::factory()->create(['role' => 'student', 'school_class_id' => $class->id]);

    // Create an active schedule
    SubjectSchedule::factory()->create([
        'school_class_id' => $class->id,
        'schedule_type' => 'morning',
        'day_of_week' => now()->dayOfWeek,
        'starts_at' => now()->subHour()->format('H:i'),
        'ends_at' => now()->addHour()->format('H:i'),
    ]);

    $this->actingAs($teacher);

    $response = $this->post(route('teacher.attendance.manual'), [
        'class_id' => $class->id,
        'students' => [
            ['student_id' => $student->id, 'status' => 'invalid_status'],
        ],
    ]);

    $response->assertSessionHasErrors('students.0.status');
});
