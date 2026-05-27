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

test('admin can view create user form', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->get('/admin/users/create')
        ->assertStatus(200)
        ->assertSee('Tambah Pengguna')
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/create'));
});

test('admin can create a user', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($admin)
        ->post('/admin/users', [
            'name' => 'Guru Baru',
            'email' => 'guru-baru@example.com',
            'role' => UserRole::Teacher->value,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

    $response->assertRedirect('/admin/users');

    $this->assertDatabaseHas('users', [
        'name' => 'Guru Baru',
        'email' => 'guru-baru@example.com',
        'role' => UserRole::Teacher->value,
    ]);
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
