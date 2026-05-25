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
            $subjects = $class->subjects()->orderBy('id')->get();

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
                    // Choose a subject for this class/time whose teacher is not
                    // already scheduled at the same day/time in another class.
                    $chosen = null;

                    foreach ($subjects as $subject) {
                        $teacherId = $subject->teacher_id;

                        // If subject has no teacher assigned, skip.
                        if (! $teacherId) {
                            continue;
                        }

                        $teacherBusy = SubjectSchedule::query()
                            ->where('day_of_week', $dayOfWeek)
                            ->where('starts_at', $slot['starts_at'])
                            ->where('ends_at', $slot['ends_at'])
                            ->whereNotNull('subject_id')
                            ->whereHas('subject', function ($q) use ($teacherId) {
                                $q->where('teacher_id', $teacherId);
                            })
                            ->exists();

                        if (! $teacherBusy) {
                            $chosen = $subject;
                            break;
                        }
                    }

                    // Create or fetch slot unique by class/day/time (no subject_id in key)
                    $schedule = SubjectSchedule::query()->firstOrCreate(
                        [
                            'school_class_id' => $class->id,
                            'schedule_type' => 'subject',
                            'day_of_week' => $dayOfWeek,
                            'starts_at' => $slot['starts_at'],
                            'ends_at' => $slot['ends_at'],
                        ],
                        ['subject_id' => $chosen?->id ?? null],
                    );

                    // If slot existed but had no subject, assign chosen subject if available
                    if (! $schedule->subject_id && $chosen) {
                        $schedule->subject_id = $chosen->id;
                        $schedule->save();
                    }
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

            // Ensure every subject in this class has at least one assigned slot.
            $unassigned = $subjects->filter(function ($subject) {
                return ! SubjectSchedule::query()->where('subject_id', $subject->id)->exists();
            });

            foreach ($unassigned as $subject) {
                $assigned = false;

                // Prefer empty slots where the subject's teacher is not busy
                $candidateSlots = SubjectSchedule::query()
                    ->where('school_class_id', $class->id)
                    ->whereNull('subject_id')
                    ->orderBy('day_of_week')
                    ->orderBy('starts_at')
                    ->get();

                foreach ($candidateSlots as $slot) {
                    $teacherId = $subject->teacher_id;

                    if (! $teacherId) {
                        // No teacher assigned; fill the slot
                        $slot->subject_id = $subject->id;
                        $slot->save();
                        $assigned = true;
                        break;
                    }

                    $teacherBusy = SubjectSchedule::query()
                        ->where('day_of_week', $slot->day_of_week)
                        ->where('starts_at', $slot->starts_at)
                        ->where('ends_at', $slot->ends_at)
                        ->whereNotNull('subject_id')
                        ->whereHas('subject', function ($q) use ($teacherId) {
                            $q->where('teacher_id', $teacherId);
                        })
                        ->exists();

                    if (! $teacherBusy) {
                        $slot->subject_id = $subject->id;
                        $slot->save();
                        $assigned = true;
                        break;
                    }
                }

                if (! $assigned) {
                    $this->command?->warn(sprintf(
                        'Could not assign subject "%s" (id:%d) to any empty slot in class id:%d without teacher conflict.',
                        $subject->name,
                        $subject->id,
                        $class->id,
                    ));
                }
            }
        }

        $this->command?->info('Seeded timetable slots for '.$classes->count().' classes.');
    }
}
