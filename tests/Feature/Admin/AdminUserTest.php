<?php

use App\Enums\UserRole;
use App\Models\User;

test('admin can view users list', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $user = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertStatus(200)
        ->assertSee($user->name);
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

    $this->actingAs($admin)
        ->get('/admin/dashboard')
        ->assertStatus(200)
        ->assertSee('Admin Dashboard');
});
