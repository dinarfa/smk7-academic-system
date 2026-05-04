<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Exam>
 */
class ExamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $teacher = User::factory()->create(['role' => UserRole::Teacher]);
        $class = SchoolClass::factory()->create();
        $subject = Subject::factory()->create([
            'school_class_id' => $class->id,
            'teacher_id' => $teacher->id,
        ]);

        return [
            'subject_id' => $subject->id,
            'class_id' => $class->id,
            'created_by' => $teacher->id,
            'title' => fake()->sentence(4),
            'instructions' => fake()->paragraph(),
            'duration_minutes' => fake()->numberBetween(30, 180),
            'status' => 'draft',
        ];
    }

    /**
     * Indicate that the exam is in draft status.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    /**
     * Indicate that the exam is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addHours(2),
        ]);
    }

    /**
     * Indicate that the exam is closed.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'closed',
            'starts_at' => now()->subHours(3),
            'ends_at' => now()->subHour(),
        ]);
    }
}
