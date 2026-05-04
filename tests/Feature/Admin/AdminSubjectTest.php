<?php

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can create update and delete subjects', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->teacher()->create();
    $class = SchoolClass::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.subjects.store'), [
            'code' => 'MTK',
            'name' => 'Mathematics',
            'school_class_id' => $class->id,
            'teacher_id' => $teacher->id,
        ])
        ->assertRedirect(route('admin.subjects.index'));

    $subject = Subject::query()->where('code', 'MTK')->firstOrFail();
    $newClass = SchoolClass::factory()->create();
    $newTeacher = User::factory()->teacher()->create();

    $this->actingAs($admin)
        ->put(route('admin.subjects.update', $subject), [
            'code' => 'MTK-1',
            'name' => 'Advanced Mathematics',
            'school_class_id' => $newClass->id,
            'teacher_id' => $newTeacher->id,
        ])
        ->assertRedirect(route('admin.subjects.index'));

    $this->assertDatabaseHas('subjects', [
        'id' => $subject->id,
        'code' => 'MTK-1',
        'name' => 'Advanced Mathematics',
        'school_class_id' => $newClass->id,
        'teacher_id' => $newTeacher->id,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.subjects.destroy', $subject))
        ->assertRedirect(route('admin.subjects.index'));

    $this->assertDatabaseMissing('subjects', [
        'id' => $subject->id,
    ]);
});

test('subject validation rejects duplicate codes', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->teacher()->create();
    $class = SchoolClass::factory()->create();

    Subject::query()->create([
        'code' => 'IPA',
        'name' => 'Science',
        'school_class_id' => $class->id,
        'teacher_id' => $teacher->id,
    ]);

    $this->actingAs($admin)
        ->post(route('admin.subjects.store'), [
            'code' => 'IPA',
            'name' => 'Natural Science',
            'school_class_id' => $class->id,
            'teacher_id' => $teacher->id,
        ])
        ->assertSessionHasErrors(['code']);
});
