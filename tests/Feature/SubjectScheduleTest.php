<?php

use App\Enums\AttendanceQrType;
use App\Enums\UserRole;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\SubjectSchedule;
use App\Models\User;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->class = SchoolClass::factory()->create();
    $this->subject = Subject::factory()->create(['school_class_id' => $this->class->id]);
});

// ── activeNow scope ────────────────────────────────────────────────────────

it('activeNow returns a slot when the current time falls inside the window', function () {
    $now = Carbon::parse('2026-05-19 10:30:00'); // Tuesday

    SubjectSchedule::factory()->create([
        'school_class_id' => $this->class->id,
        'subject_id' => $this->subject->id,
        'schedule_type' => 'subject',
        'day_of_week' => $now->dayOfWeek,
        'starts_at' => '10:00',
        'ends_at' => '11:30',
    ]);

    $result = SubjectSchedule::query()
        ->where('school_class_id', $this->class->id)
        ->activeNow($now)
        ->first();

    expect($result)->not->toBeNull();
});

it('activeNow returns null when the time is outside the window', function () {
    $now = Carbon::parse('2026-05-19 09:00:00'); // before slot (Tuesday)

    SubjectSchedule::factory()->create([
        'school_class_id' => $this->class->id,
        'schedule_type' => 'subject',
        'day_of_week' => $now->dayOfWeek,
        'starts_at' => '10:00',
        'ends_at' => '11:30',
    ]);

    $result = SubjectSchedule::query()
        ->where('school_class_id', $this->class->id)
        ->activeNow($now)
        ->first();

    expect($result)->toBeNull();
});

it('activeNow returns null when the day of week does not match', function () {
    $now = Carbon::parse('2026-05-19 10:30:00'); // Tuesday (dayOfWeek=1)

    SubjectSchedule::factory()->create([
        'school_class_id' => $this->class->id,
        'schedule_type' => 'subject',
        'day_of_week' => 3, // Wednesday
        'starts_at' => '10:00',
        'ends_at' => '11:30',
    ]);

    $result = SubjectSchedule::query()
        ->where('school_class_id', $this->class->id)
        ->activeNow($now)
        ->first();

    expect($result)->toBeNull();
});

// ── findClosestSlot ────────────────────────────────────────────────────────

it('findClosestSlot returns the nearest slot when scan time is between two slots', function () {
    $now = Carbon::parse('2026-05-19 09:30:00'); // between morning and subject

    SubjectSchedule::factory()->create([
        'school_class_id' => $this->class->id,
        'schedule_type' => 'morning',
        'day_of_week' => $now->dayOfWeek,
        'starts_at' => '07:00',
        'ends_at' => '08:00',
    ]);

    SubjectSchedule::factory()->create([
        'school_class_id' => $this->class->id,
        'schedule_type' => 'subject',
        'day_of_week' => $now->dayOfWeek,
        'starts_at' => '10:00',
        'ends_at' => '11:30',
    ]);

    $slot = SubjectSchedule::findClosestSlot($this->class->id, $now);

    // 09:30 is 90 min after morning end (08:00) and 30 min before subject start (10:00)
    // closest = subject slot
    expect($slot)->not->toBeNull()
        ->and($slot->schedule_type)->toBe('subject');
});

it('findClosestSlot returns null when there are no schedules for the class', function () {
    $now = Carbon::parse('2026-05-19 10:30:00');

    $slot = SubjectSchedule::findClosestSlot($this->class->id, $now);

    expect($slot)->toBeNull();
});

// ── resolveQrType ──────────────────────────────────────────────────────────

it('resolves morning type correctly', function () {
    $schedule = SubjectSchedule::factory()->make(['schedule_type' => 'morning']);

    expect($schedule->resolveQrType())->toBe(AttendanceQrType::Morning);
});

it('resolves subject type correctly', function () {
    $schedule = SubjectSchedule::factory()->make(['schedule_type' => 'subject']);

    expect($schedule->resolveQrType())->toBe(AttendanceQrType::Subject);
});

it('resolves dismissal type correctly', function () {
    $schedule = SubjectSchedule::factory()->make(['schedule_type' => 'dismissal']);

    expect($schedule->resolveQrType())->toBe(AttendanceQrType::Dismissal);
});

// ── Admin CRUD ─────────────────────────────────────────────────────────────

it('admin can create a schedule slot', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($admin)->post(route('admin.schedules.store'), [
        'school_class_id' => $this->class->id,
        'subject_id' => $this->subject->id,
        'schedule_type' => 'subject',
        'day_of_week' => 1,
        'starts_at' => '10:00',
        'ends_at' => '11:30',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('subject_schedules', [
        'school_class_id' => $this->class->id,
        'schedule_type' => 'subject',
        'day_of_week' => 1,
    ]);
});

it('admin can delete a schedule slot', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $schedule = SubjectSchedule::factory()->create([
        'school_class_id' => $this->class->id,
        'schedule_type' => 'morning',
        'day_of_week' => 1,
        'starts_at' => '07:00',
        'ends_at' => '08:00',
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.schedules.destroy', $schedule))
        ->assertRedirect();

    $this->assertDatabaseMissing('subject_schedules', ['id' => $schedule->id]);
});
