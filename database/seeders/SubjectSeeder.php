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
        ];

        $classes = SchoolClass::query()->orderBy('id')->get();
        $teachers = User::query()->where('role', 'teacher')->orderBy('id')->get();

        if ($classes->isEmpty() || $teachers->isEmpty()) {
            $this->command?->warn('SubjectSeeder skipped: classes or teachers missing.');

            return;
        }

        foreach ($subjectNames as $index => $subjectName) {
            $subject = Subject::query()->create([
                'teacher_id' => $teachers->random()->id,
                'name' => $subjectName,
                'code' => 'MAP'.($index + 1),
            ]);

            // Attach subject to 2-4 random classes
            $randomClasses = $classes->random(rand(2, min(4, $classes->count())));
            $subject->schoolClasses()->attach($randomClasses->pluck('id'));
        }

        $this->command?->info('Seeded '.count($subjectNames).' subjects across '.$classes->count().' classes.');
    }
}
