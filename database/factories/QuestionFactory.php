<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'exam_id' => Exam::factory(),
            'prompt' => fake()->sentence().'?',
            'type' => 'multiple_choice',
            'points' => fake()->numberBetween(1, 10),
            'sort_order' => 0,
            'explanation' => fake()->paragraph(),
        ];
    }
}
