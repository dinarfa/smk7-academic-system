<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can view users list', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $user = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertStatus(200)
        ->assertSee($user->name)
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index'),
        );
});

test('non-admin cannot view users list', function () {
    $user = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($user)
        ->get('/admin/users')
        ->assertStatus(403);
});

test('admin can reset user password', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $user = User::factory()->create(['role' => UserRole::Student]);

    $response = $this->actingAs($admin)
        ->post("/admin/users/{$user->id}/reset-password", [
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

    expect($response->getStatusCode())->toBe(302);
});

test('admin can view user details with audit logs', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $user = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($admin)
        ->get("/admin/users/{$user->id}")
        ->assertStatus(200)
        ->assertSee($user->name)
        ->assertSee($user->email);
});

test('admin can access admin dashboard', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($admin)
        ->get('/admin/dashboard');

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/dashboard'),
    );
});
