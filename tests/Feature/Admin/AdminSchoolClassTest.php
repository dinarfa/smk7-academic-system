<?php

use App\Enums\UserRole;
use App\Models\Department;
use App\Models\SchoolClass;
use App\Models\User;

test('admin can generate a class for a teacher', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $department = Department::factory()->create(['code' => 'TKJ']);

    $this->actingAs($admin)
        ->post('/admin/classes', [
            'homeroom_teacher_id' => $teacher->id,
            'department_id' => $department->id,
            'grade_level' => 'X',
            'section' => 1,
            'code' => 'X-TKJ-1',
            'academic_year' => '2026/2027',
        ])
        ->assertRedirect();

    $schoolClass = SchoolClass::query()->where('homeroom_teacher_id', $teacher->id)->firstOrFail();

    expect($schoolClass->name)->toBe('X TKJ 1');
    expect($schoolClass->grade_level)->toBe('X');
    expect($schoolClass->section)->toBe(1);
    expect($schoolClass->code)->toBe('X-TKJ-1');
});

test('non-admin cannot generate classes', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $department = Department::factory()->create();

    $this->actingAs($teacher)
        ->post('/admin/classes', [
            'homeroom_teacher_id' => $teacher->id,
            'department_id' => $department->id,
            'grade_level' => 'X',
            'section' => 1,
            'code' => 'X-IPA-1',
            'academic_year' => '2026/2027',
        ])
        ->assertStatus(403);
});
