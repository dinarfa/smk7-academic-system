<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SchoolClass>
 */
class SchoolClassFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'homeroom_teacher_id' => User::factory()->state(['role' => UserRole::Teacher]),
            'name' => fake()->randomElement(['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XII IPS 1']),
            'code' => fake()->unique()->bothify('CL-###'),
            'academic_year' => fake()->randomElement(['2025/2026', '2026/2027']),
        ];
    }
}
