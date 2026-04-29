<?php

use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\User;

test('admin can view reports overview', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->get('/admin/reports/overview')
        ->assertStatus(200)
        ->assertSee('Reports Overview');
});

test('admin can view reports by session', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $session = AttendanceSession::factory()->create(['opened_by' => $teacher->id]);

    $response = $this->actingAs($admin)
        ->get('/admin/reports/by-session');

    expect($response->getStatusCode())->toBe(200);
});

test('admin can view reports by student', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $student = User::factory()->create(['role' => UserRole::Student]);

    $response = $this->actingAs($admin)
        ->get('/admin/reports/by-student');

    expect($response->getStatusCode())->toBe(200);
});

test('admin can export attendance data', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);
    $student = User::factory()->create(['role' => UserRole::Student]);
    $session = AttendanceSession::factory()->create(['opened_by' => $teacher->id]);
    AttendanceRecord::factory()->create([
        'attendance_session_id' => $session->id,
        'student_id' => $student->id,
    ]);

    $response = $this->actingAs($admin)
        ->get('/admin/reports/export');

    expect($response->getStatusCode())->toBe(200);
    expect($response->headers->get('content-type'))->toContain('csv');
});

test('non-admin cannot access reports', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($student)
        ->get('/admin/reports/overview')
        ->assertStatus(403);
});
