<?php

use App\Enums\UserRole;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;

test('teacher sees only their subjects', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $otherTeacher = User::factory()->create(['role' => UserRole::Teacher]);

    $class = SchoolClass::factory()->create();

    $visibleSubject = Subject::factory()->create([
        'name' => 'Mathematics',
        'teacher_id' => $teacher->id,
    ]);
    $visibleSubject->schoolClasses()->attach($class->id, ['teacher_id' => $teacher->id]);

    $otherSubject = Subject::factory()->create([
        'name' => 'Biology',
        'teacher_id' => $otherTeacher->id,
    ]);
    $otherSubject->schoolClasses()->attach($class->id, ['teacher_id' => $otherTeacher->id]);

    $this->actingAs($teacher)
        ->get('/teacher/subjects')
        ->assertStatus(200)
        ->assertSee($visibleSubject->name)
        ->assertDontSee('Biology');
});
