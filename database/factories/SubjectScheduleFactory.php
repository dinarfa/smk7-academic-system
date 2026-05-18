<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\SubjectSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubjectSchedule>
 */
class SubjectScheduleFactory extends Factory
{
    protected $model = SubjectSchedule::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['morning', 'subject', 'dismissal']);
        $startHour = $this->faker->numberBetween(7, 14);
        $endHour = $startHour + 1;

        return [
            'school_class_id' => SchoolClass::factory(),
            'subject_id' => $type === 'subject' ? Subject::factory() : null,
            'schedule_type' => $type,
            'day_of_week' => $this->faker->numberBetween(1, 6), // Mon–Sat
            'starts_at' => sprintf('%02d:00', $startHour),
            'ends_at' => sprintf('%02d:30', $endHour),
        ];
    }
}
