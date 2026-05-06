<?php

use App\Enums\UserRole;
use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('student sees only active exams for their class', function () {
    $class = SchoolClass::factory()->create();
    $student = User::factory()->create([
        'role' => UserRole::Student,
        'school_class_id' => $class->id,
    ]);
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);

    $subject = Subject::factory()->create([
        'school_class_id' => $class->id,
        'teacher_id' => $teacher->id,
    ]);

    $activeExam = Exam::query()->create([
        'title' => 'Ujian Aktif',
        'subject_id' => $subject->id,
        'class_id' => $class->id,
        'created_by' => $teacher->id,
        'duration_minutes' => 60,
        'status' => 'active',
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addHour(),
    ]);

    Exam::query()->create([
        'title' => 'Ujian Masa Depan',
        'subject_id' => $subject->id,
        'class_id' => $class->id,
        'created_by' => $teacher->id,
        'duration_minutes' => 60,
        'status' => 'active',
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDays(2),
    ]);

    $otherClass = SchoolClass::factory()->create();
    $otherSubject = Subject::factory()->create([
        'school_class_id' => $otherClass->id,
        'teacher_id' => $teacher->id,
    ]);

    Exam::query()->create([
        'title' => 'Ujian Kelas Lain',
        'subject_id' => $otherSubject->id,
        'class_id' => $otherClass->id,
        'created_by' => $teacher->id,
        'duration_minutes' => 60,
        'status' => 'active',
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addHour(),
    ]);

    $hiddenExam = Exam::query()->create([
        'title' => 'Ujian Tersembunyi',
        'subject_id' => $subject->id,
        'class_id' => $class->id,
        'created_by' => $teacher->id,
        'duration_minutes' => 60,
        'status' => 'draft',
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addHour(),
    ]);

    $this->actingAs($student)
        ->get('/student/exams')
        ->assertStatus(200)
        ->assertSee($activeExam->title)
        ->assertDontSee('Ujian Masa Depan')
        ->assertDontSee('Ujian Kelas Lain')
        ->assertDontSee($hiddenExam->title)
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/exams/index')
            ->has('exams.data', 1)
            ->where('exams.data.0.title', $activeExam->title));
});
