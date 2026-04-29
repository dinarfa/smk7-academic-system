<?php

use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can create update and delete subjects', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.subjects.store'), [
            'code' => 'MTK',
            'name' => 'Mathematics',
        ])
        ->assertRedirect(route('admin.subjects.index'));

    $subject = Subject::query()->where('code', 'MTK')->firstOrFail();

    $this->actingAs($admin)
        ->put(route('admin.subjects.update', $subject), [
            'code' => 'MTK-1',
            'name' => 'Advanced Mathematics',
        ])
        ->assertRedirect(route('admin.subjects.index'));

    $this->assertDatabaseHas('subjects', [
        'id' => $subject->id,
        'code' => 'MTK-1',
        'name' => 'Advanced Mathematics',
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

    Subject::query()->create([
        'code' => 'IPA',
        'name' => 'Science',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.subjects.store'), [
            'code' => 'IPA',
            'name' => 'Natural Science',
        ])
        ->assertSessionHasErrors(['code']);
});
