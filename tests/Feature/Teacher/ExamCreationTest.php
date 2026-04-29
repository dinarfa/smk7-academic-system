<?php

use App\Enums\UserRole;
use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;

test('teacher can view exam creation form', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create(['school_class_id' => $schoolClass->id, 'teacher_id' => $teacher->id]);

    $this->actingAs($teacher)
        ->get('/teacher/exams/create')
        ->assertStatus(200)
        ->assertViewIs('app');
});

test('teacher can create exam with valid data', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create(['school_class_id' => $schoolClass->id, 'teacher_id' => $teacher->id]);

    $this->actingAs($teacher)
        ->post('/teacher/exams', [
            'title' => 'Ujian Matematika Semester 1',
            'subject_id' => $subject->id,
            'class_id' => $schoolClass->id,
            'duration_minutes' => 90,
            'instructions' => 'Jawab semua pertanyaan dengan benar.',
        ])
        ->assertRedirect('/teacher/exams');

    $this->assertDatabaseHas('exams', [
        'title' => 'Ujian Matematika Semester 1',
        'subject_id' => $subject->id,
        'class_id' => $schoolClass->id,
        'duration_minutes' => 90,
        'created_by' => $teacher->id,
        'status' => 'draft',
    ]);
});

test('subject must exist validation', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $schoolClass = SchoolClass::factory()->create();

    $this->actingAs($teacher)
        ->post('/teacher/exams', [
            'title' => 'Test Exam',
            'subject_id' => 9999,
            'class_id' => $schoolClass->id,
            'duration_minutes' => 60,
        ])
        ->assertSessionHasErrors('subject_id');
});

test('class must exist validation', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create(['school_class_id' => $schoolClass->id, 'teacher_id' => $teacher->id]);

    $this->actingAs($teacher)
        ->post('/teacher/exams', [
            'title' => 'Test Exam',
            'subject_id' => $subject->id,
            'class_id' => 9999,
            'duration_minutes' => 60,
        ])
        ->assertSessionHasErrors('class_id');
});

test('duration validation min 5 max 480 minutes', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create(['school_class_id' => $schoolClass->id, 'teacher_id' => $teacher->id]);

    // Test minimum duration (less than 5)
    $this->actingAs($teacher)
        ->post('/teacher/exams', [
            'title' => 'Test Exam',
            'subject_id' => $subject->id,
            'class_id' => $schoolClass->id,
            'duration_minutes' => 3,
        ])
        ->assertSessionHasErrors('duration_minutes');

    // Test maximum duration (more than 480)
    $this->actingAs($teacher)
        ->post('/teacher/exams', [
            'title' => 'Test Exam',
            'subject_id' => $subject->id,
            'class_id' => $schoolClass->id,
            'duration_minutes' => 500,
        ])
        ->assertSessionHasErrors('duration_minutes');

    // Test valid duration (5 minutes)
    $this->actingAs($teacher)
        ->post('/teacher/exams', [
            'title' => 'Test Exam',
            'subject_id' => $subject->id,
            'class_id' => $schoolClass->id,
            'duration_minutes' => 5,
        ])
        ->assertRedirect();

    // Test valid duration (480 minutes)
    $schoolClass2 = SchoolClass::factory()->create();
    $subject2 = Subject::factory()->create(['school_class_id' => $schoolClass2->id, 'teacher_id' => $teacher->id]);

    $this->actingAs($teacher)
        ->post('/teacher/exams', [
            'title' => 'Test Exam 2',
            'subject_id' => $subject2->id,
            'class_id' => $schoolClass2->id,
            'duration_minutes' => 480,
        ])
        ->assertRedirect();
});

test('created exam is associated with creator', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create(['school_class_id' => $schoolClass->id, 'teacher_id' => $teacher->id]);

    $this->actingAs($teacher)
        ->post('/teacher/exams', [
            'title' => 'Ujian Matematika',
            'subject_id' => $subject->id,
            'class_id' => $schoolClass->id,
            'duration_minutes' => 90,
        ])
        ->assertRedirect();

    $exam = Exam::where('title', 'Ujian Matematika')->firstOrFail();

    expect($exam->created_by)->toBe($teacher->id);
    expect($exam->creator()->first()->id)->toBe($teacher->id);
});

test('only teachers can create exams', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create(['school_class_id' => $schoolClass->id]);

    $this->actingAs($student)
        ->post('/teacher/exams', [
            'title' => 'Test Exam',
            'subject_id' => $subject->id,
            'class_id' => $schoolClass->id,
            'duration_minutes' => 60,
        ])
        ->assertStatus(403);

    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->post('/teacher/exams', [
            'title' => 'Test Exam',
            'subject_id' => $subject->id,
            'class_id' => $schoolClass->id,
            'duration_minutes' => 60,
        ])
        ->assertStatus(403);
});

test('teacher can list their own exams', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $otherTeacher = User::factory()->create(['role' => UserRole::Teacher]);
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create(['school_class_id' => $schoolClass->id, 'teacher_id' => $teacher->id]);

    // Create exams for both teachers
    $teacherExam = Exam::factory()->create(['created_by' => $teacher->id, 'subject_id' => $subject->id, 'class_id' => $schoolClass->id, 'title' => 'Teacher Exam']);
    $otherTeacherExam = Exam::factory()->create(['created_by' => $otherTeacher->id, 'title' => 'Other Teacher Exam']);

    $response = $this->actingAs($teacher)
        ->get('/teacher/exams')
        ->assertStatus(200);

    // The response should contain teacher's exam
    $response->assertSee($teacherExam->title);

    // The response should not contain other teacher's exam
    $response->assertDontSee($otherTeacherExam->title);
});
