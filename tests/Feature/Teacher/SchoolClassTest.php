<?php

use App\Enums\UserRole;
use App\Models\SchoolClass;
use App\Models\User;

test('teacher can add students to an admin-generated class', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);

    $schoolClass = SchoolClass::factory()->create([
        'homeroom_teacher_id' => $teacher->id,
        'name' => 'X IPA 1',
        'code' => 'X-IPA-1',
        'academic_year' => '2026/2027',
    ]);

    expect($schoolClass->name)->toBe('X IPA 1');

    $this->actingAs($teacher)
        ->post('/teacher/students', [
            'name' => 'Student One',
            'email' => 'student-one@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertRedirect();

    $student = User::query()->where('email', 'student-one@example.com')->firstOrFail();

    expect($student->role)->toBe(UserRole::Student);
    expect($student->school_class_id)->toBe($schoolClass->id);
});

test('teacher sees students from their class only', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $otherTeacher = User::factory()->create(['role' => UserRole::Teacher]);
    $otherClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $otherTeacher->id]);

    $studentInClass = User::factory()->create([
        'role' => UserRole::Student,
        'school_class_id' => $schoolClass->id,
        'name' => 'Visible Student',
    ]);

    User::factory()->create([
        'role' => UserRole::Student,
        'school_class_id' => $otherClass->id,
        'name' => 'Hidden Student',
    ]);

    $this->actingAs($teacher)
        ->get('/teacher/students')
        ->assertStatus(200)
        ->assertSee($studentInClass->name)
        ->assertDontSee('Hidden Student');
});
