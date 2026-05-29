<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\SubjectSchedule;
use Illuminate\Database\Seeder;

class SubjectScheduleSeeder extends Seeder
{
    /**
     * Seed timetable slots for each class.
     *
     * Greedy assignment with fair rotation:
     * - Pre-create all schedule rows (morning + 3 subject + dismissal per class/day).
     * - Per day, shuffle class order so no class is consistently last.
     * - For each slot, pick the first subject whose teacher is free.
     * - Global fallback ensures every subject gets at least one slot.
     */
    public function run(): void
    {
        $classes = SchoolClass::query()->orderBy('id')->get();

        if ($classes->isEmpty()) {
            $this->command?->warn('SubjectScheduleSeeder skipped: no classes found.');

            return;
        }

        $timeSlots = [
            ['starts_at' => '08:00', 'ends_at' => '09:30'],
            ['starts_at' => '09:45', 'ends_at' => '11:15'],
            ['starts_at' => '11:30', 'ends_at' => '13:00'],
        ];

        // Pre-create all schedule rows
        foreach ($classes as $class) {
            foreach (range(1, 6) as $dayOfWeek) {
                SubjectSchedule::query()->firstOrCreate([
                    'school_class_id' => $class->id,
                    'schedule_type' => 'morning',
                    'day_of_week' => $dayOfWeek,
                    'starts_at' => '07:00',
                    'ends_at' => '08:00',
                ], ['subject_id' => null]);

                foreach ($timeSlots as $slot) {
                    SubjectSchedule::query()->firstOrCreate([
                        'school_class_id' => $class->id,
                        'schedule_type' => 'subject',
                        'day_of_week' => $dayOfWeek,
                        'starts_at' => $slot['starts_at'],
                        'ends_at' => $slot['ends_at'],
                    ], ['subject_id' => null]);
                }

                SubjectSchedule::query()->firstOrCreate([
                    'school_class_id' => $class->id,
                    'schedule_type' => 'dismissal',
                    'day_of_week' => $dayOfWeek,
                    'starts_at' => '15:00',
                    'ends_at' => '15:30',
                ], ['subject_id' => null]);
            }
        }

        // Load class subjects
        $classSubjects = [];
        foreach ($classes as $class) {
            $classSubjects[$class->id] = $class->subjects()->orderBy('id')->get();
        }

        // Greedy assignment: per day, shuffle classes, fill each slot
        foreach (range(1, 6) as $dayOfWeek) {
            $dayClasses = $classes->shuffle();

            foreach ($timeSlots as $slot) {
                foreach ($dayClasses as $class) {
                    $subjects = $classSubjects[$class->id];
                    if ($subjects->isEmpty()) {
                        continue;
                    }

                    $schedule = SubjectSchedule::query()
                        ->where('school_class_id', $class->id)
                        ->where('schedule_type', 'subject')
                        ->where('day_of_week', $dayOfWeek)
                        ->where('starts_at', $slot['starts_at'])
                        ->where('ends_at', $slot['ends_at'])
                        ->first();

                    if (! $schedule || $schedule->subject_id) {
                        continue;
                    }

                    $daySubjects = $subjects->shuffle();
                    foreach ($daySubjects as $subject) {
                        // Resolve teacher: pivot teacher_id for this class, then fallback to default
                        $pivotTeacherId = $subject->schoolClasses()
                            ->where('school_classes.id', $class->id)
                            ->first()?->pivot?->teacher_id;
                        $teacherId = $pivotTeacherId ?? $subject->teacher_id;

                        if (! $teacherId) {
                            continue;
                        }

                        $teacherBusy = SubjectSchedule::query()
                            ->where('day_of_week', $dayOfWeek)
                            ->where('starts_at', $slot['starts_at'])
                            ->where('ends_at', $slot['ends_at'])
                            ->whereNotNull('subject_id')
                            ->where(function ($q) use ($teacherId) {
                                $q->whereHas('subject', fn ($q2) => $q2->where('teacher_id', $teacherId))
                                    ->orWhereHas('subject.schoolClasses', fn ($q2) => $q2->wherePivot('teacher_id', $teacherId));
                            })
                            ->exists();

                        if (! $teacherBusy) {
                            $schedule->subject_id = $subject->id;
                            $schedule->save();
                            break;
                        }
                    }
                }
            }
        }

        // Global fallback: ensure every subject has at least one slot
        $allSubjects = Subject::query()->orderBy('id')->get();
        foreach ($allSubjects as $subject) {
            if (SubjectSchedule::query()->where('subject_id', $subject->id)->exists()) {
                continue;
            }

            $emptySlots = SubjectSchedule::query()
                ->where('schedule_type', 'subject')
                ->whereNull('subject_id')
                ->orderBy('day_of_week')
                ->orderBy('starts_at')
                ->get();

            foreach ($emptySlots as $slot) {
                // Resolve teacher for this slot's class
                $pivotTeacherId = $subject->schoolClasses()
                    ->where('school_classes.id', $slot->school_class_id)
                    ->first()?->pivot?->teacher_id;
                $teacherId = $pivotTeacherId ?? $subject->teacher_id;

                $teacherBusy = SubjectSchedule::query()
                    ->where('day_of_week', $slot->day_of_week)
                    ->where('starts_at', $slot->starts_at)
                    ->where('ends_at', $slot->ends_at)
                    ->whereNotNull('subject_id')
                    ->where(function ($q) use ($teacherId) {
                        $q->whereHas('subject', fn ($q2) => $q2->where('teacher_id', $teacherId))
                            ->orWhereHas('subject.schoolClasses', fn ($q2) => $q2->wherePivot('teacher_id', $teacherId));
                    })
                    ->exists();

                if (! $teacherBusy) {
                    $slot->subject_id = $subject->id;
                    $slot->save();
                    break;
                }
            }
        }

        $this->command?->info('Seeded timetable slots for '.$classes->count().' classes.');
    }
}
