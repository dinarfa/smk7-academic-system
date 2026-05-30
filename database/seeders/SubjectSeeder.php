<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Seed subjects and attach them to classes with teachers on pivot.
     *
     * 10 subjects, each → 3 classes via round-robin.
     * Teacher assigned per class via pivot table.
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

        $classIds = $classes->pluck('id')->toArray();
        $classesPerSubject = 3;
        $pairIndex = 0;

        foreach ($subjectNames as $index => $subjectName) {
            $subject = Subject::firstOrCreate(
                ['name' => $subjectName],
            );

            $assignedClasses = [];
            for ($j = 0; $j < $classesPerSubject; $j++) {
                $assignedClasses[] = $classIds[$pairIndex % count($classIds)];
                $pairIndex++;
            }

            // Sync only if not already attached (with teacher_id on pivot)
            $existingIds = $subject->schoolClasses()->pluck('school_classes.id')->toArray();
            $newIds = array_diff($assignedClasses, $existingIds);
            if (! empty($newIds)) {
                $teacherId = $teachers[$index % $teachers->count()]->id;
                $attachData = [];
                foreach ($newIds as $classId) {
                    $attachData[$classId] = ['teacher_id' => $teacherId];
                }
                $subject->schoolClasses()->attach($attachData);
            }
        }

        $this->command?->info('Seeded '.count($subjectNames).' subjects across '.$classes->count().' classes.');
    }
}
