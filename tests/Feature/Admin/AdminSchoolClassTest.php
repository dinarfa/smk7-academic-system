<?php

use App\Enums\UserRole;
use App\Models\SchoolClass;
use App\Models\User;

test('admin can generate a class for a teacher', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);

    $this->actingAs($admin)
        ->post('/admin/classes', [
            'homeroom_teacher_id' => $teacher->id,
            'name' => 'X IPA 1',
            'code' => 'X-IPA-1',
            'academic_year' => '2026/2027',
        ])
        ->assertRedirect();

    $schoolClass = SchoolClass::query()->where('homeroom_teacher_id', $teacher->id)->firstOrFail();

    expect($schoolClass->name)->toBe('X IPA 1');
    expect($schoolClass->code)->toBe('X-IPA-1');
});

test('non-admin cannot generate classes', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);

    $this->actingAs($teacher)
        ->post('/admin/classes', [
            'homeroom_teacher_id' => $teacher->id,
            'name' => 'X IPA 1',
            'code' => 'X-IPA-1',
            'academic_year' => '2026/2027',
        ])
        ->assertStatus(403);
});
