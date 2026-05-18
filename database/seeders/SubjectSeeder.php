<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Seed subjects for each existing class.
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

        foreach ($classes as $class) {
            $classSubjects = collect($subjectNames)->random(rand(3, 4));
            $subjCounter = 1;

            foreach ($classSubjects as $subjectName) {
                Subject::query()->create([
                    'school_class_id' => $class->id,
                    'teacher_id' => $teachers->random()->id,
                    'name' => $subjectName,
                    'code' => strtoupper(substr($subjectName, 0, 3)).'-'.$class->id.'-'.$subjCounter++,
                ]);
            }
        }

        $this->command?->info('Seeded subjects for '.$classes->count().' classes.');
    }
}