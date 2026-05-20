<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\SubjectSchedule;
use Illuminate\Database\Seeder;

class SubjectScheduleSeeder extends Seeder
{
    /**
     * Seed sample timetable slots for each class.
     */
    public function run(): void
    {
        $classes = SchoolClass::query()->orderBy('id')->get();

        if ($classes->isEmpty()) {
            $this->command?->warn('SubjectScheduleSeeder skipped: no classes found.');

            return;
        }

        foreach ($classes as $class) {
            $subjects = Subject::query()
                ->where('school_class_id', $class->id)
                ->orderBy('id')
                ->get();

            if ($subjects->isEmpty()) {
                continue;
            }

            foreach (range(1, 6) as $dayOfWeek) {
                $subjectSlots = [
                    ['starts_at' => '08:00', 'ends_at' => '09:30'],
                    ['starts_at' => '09:45', 'ends_at' => '11:15'],
                    ['starts_at' => '11:30', 'ends_at' => '13:00'],
                ];

                SubjectSchedule::query()->firstOrCreate(
                    [
                        'school_class_id' => $class->id,
                        'schedule_type' => 'morning',
                        'day_of_week' => $dayOfWeek,
                        'starts_at' => '07:00',
                        'ends_at' => '08:00',
                    ],
                    ['subject_id' => null],
                );

                foreach ($subjectSlots as $index => $slot) {
                    $subject = $subjects[$index % $subjects->count()];

                    SubjectSchedule::query()->firstOrCreate(
                        [
                            'school_class_id' => $class->id,
                            'subject_id' => $subject->id,
                            'schedule_type' => 'subject',
                            'day_of_week' => $dayOfWeek,
                            'starts_at' => $slot['starts_at'],
                            'ends_at' => $slot['ends_at'],
                        ]
                    );
                }

                SubjectSchedule::query()->firstOrCreate(
                    [
                        'school_class_id' => $class->id,
                        'schedule_type' => 'dismissal',
                        'day_of_week' => $dayOfWeek,
                        'starts_at' => '15:00',
                        'ends_at' => '15:30',
                    ],
                    ['subject_id' => null],
                );
            }
        }

        $this->command?->info('Seeded timetable slots for '.$classes->count().' classes.');
    }
}
