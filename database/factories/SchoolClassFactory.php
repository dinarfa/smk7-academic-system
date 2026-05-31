<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Department;
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
        $gradeLevel = fake()->randomElement(['X', 'XI', 'XII']);
        $section = fake()->numberBetween(1, 3);

        return [
            'homeroom_teacher_id' => User::factory()->state(['role' => UserRole::Teacher]),
            'department_id' => Department::factory(),
            'name' => '', // overridden by afterCreating
            'grade_level' => $gradeLevel,
            'section' => $section,
            'code' => fake()->unique()->bothify('CL-###'),
            'academic_year' => fake()->randomElement(['2025/2026', '2026/2027']),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (SchoolClass $schoolClass): void {
            if (empty($schoolClass->name)) {
                $deptCode = $schoolClass->department?->code ?? 'UMUM';
                $schoolClass->update([
                    'name' => "{$schoolClass->grade_level} {$deptCode} {$schoolClass->section}",
                ]);
            }
        });
    }
}
