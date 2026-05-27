<?php

use App\Enums\UserRole;
use App\Models\SchoolClass;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can add students to a class', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->teacher()->create();

    $schoolClass = SchoolClass::factory()->create([
        'homeroom_teacher_id' => $teacher->id,
        'name' => 'X IPA 1',
        'code' => 'X-IPA-1',
        'academic_year' => '2026/2027',
    ]);

    expect($schoolClass->name)->toBe('X IPA 1');

    $this->actingAs($admin)
        ->post(route('teacher.students.store'), [
            'name' => 'Student One',
            'email' => 'student-one@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'school_class_id' => $schoolClass->id,
        ])
        ->assertRedirect();

    $student = User::query()->where('email', 'student-one@example.com')->firstOrFail();

    expect($student->role)->toBe(UserRole::Student);
    expect($student->school_class_id)->toBe($schoolClass->id);
});

test('teacher sees students from their class only', function () {
    $teacher = User::factory()->teacher()->create();
    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $otherTeacher = User::factory()->teacher()->create();
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
        ->get(route('teacher.students.index'))
        ->assertOk()
        ->assertSee($studentInClass->name)
        ->assertDontSee('Hidden Student')
        ->assertDontSee('Tambah Akun Siswa');
});

test('admin sees all students across classes', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->teacher()->create();
    $otherTeacher = User::factory()->teacher()->create();

    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
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

    $this->actingAs($admin)
        ->get(route('teacher.students.index'))
        ->assertStatus(200)
        ->assertSee($studentInClass->name)
        ->assertSee('Hidden Student');
});

test('teacher cannot mutate student accounts', function () {
    $teacher = User::factory()->teacher()->create();
    $schoolClass = SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);
    $student = User::factory()->student()->create(['school_class_id' => $schoolClass->id]);

    $this->actingAs($teacher)->post(route('teacher.students.store'), [
        'name' => 'Budi',
        'email' => 'budi@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'school_class_id' => $schoolClass->id,
    ])->assertForbidden();

    $this->actingAs($teacher)->put(route('teacher.students.update', $student), [
        'name' => 'Budi Santoso',
        'email' => 'budi.santoso@example.com',
        'school_class_id' => $schoolClass->id,
    ])->assertForbidden();

    $this->actingAs($teacher)->delete(route('teacher.students.destroy', $student))
        ->assertForbidden();
});

test('teacher without homeroom class does not see kelas wali menu', function () {
    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->get(route('teacher.dashboard'))
        ->assertOk()
        ->assertDontSee('Kelas Wali')
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.homeroom_classes_count', 0));
});

test('teacher with homeroom class sees kelas wali menu', function () {
    $teacher = User::factory()->teacher()->create();

    SchoolClass::factory()->create(['homeroom_teacher_id' => $teacher->id]);

    $this->actingAs($teacher)
        ->get(route('teacher.dashboard'))
        ->assertOk()
        ->assertSee('Kelas Wali')
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.homeroom_classes_count', 1));
});
