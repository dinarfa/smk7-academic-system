<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subject>
 */
class SubjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'teacher_id' => User::factory()->state(['role' => UserRole::Teacher]),
            'name' => fake()->word().' '.fake()->word(),
            'is_active' => true,
        ];
    }
}
