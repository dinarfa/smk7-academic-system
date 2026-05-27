<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Seed subjects and attach them to classes.
     *
     * 10 subjects (1 per teacher), each → 3 classes via round-robin.
     * Result: each class gets exactly 3 subjects, no teacher overlap within a class.
     * Schedule conflicts across classes handled by SubjectScheduleSeeder.
     */
    public function run(): void
    {
        $subjectNames = [
            'Matematika',
            'Bahasa Indonesia',
            'Bahasa Inggris',
            'Fisika',
            'Kimia',
            'Biologi',
            'Ekonomi',
            'Sejarah',
            'Pendidikan Agama',
            'PJOK',
        ];

        $classes = SchoolClass::query()->orderBy('id')->get();
        $teachers = User::query()->where('role', 'teacher')->orderBy('id')->get();

        if ($classes->isEmpty() || $teachers->isEmpty()) {
            $this->command?->warn('SubjectSeeder skipped: classes or teachers missing.');

            return;
        }

        // Round-robin: each subject → 3 classes, cycling through class list.
        // With 10 subjects × 3 classes = 30 pairs and 10 classes, each class gets exactly 3.
        $classIds = $classes->pluck('id')->toArray();
        $classesPerSubject = 3;
        $pairIndex = 0;

        foreach ($subjectNames as $index => $subjectName) {
            $subject = Subject::query()->create([
                'teacher_id' => $teachers[$index % $teachers->count()]->id,
                'name' => $subjectName,
                'code' => 'MAP'.($index + 1),
            ]);

            $assignedClasses = [];
            for ($j = 0; $j < $classesPerSubject; $j++) {
                $assignedClasses[] = $classIds[$pairIndex % count($classIds)];
                $pairIndex++;
            }
            $subject->schoolClasses()->attach($assignedClasses);
        }

        $this->command?->info('Seeded '.count($subjectNames).' subjects across '.$classes->count().' classes.');
    }
}
