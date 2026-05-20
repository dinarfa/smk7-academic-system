<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentClassSeeder extends Seeder
{
    public function run(): void
    {
        // 5 teachers
        $teachers = User::factory()
            ->count(5)
            ->teacher()
            ->create()
            ->each(fn (User $t, int $i) => $t->update([
                'name' => "Guru {$i}",
                'email' => "guru{$i}@example.com",
            ]));

        // 10 classes, each with homeroom teacher + subjects
        $classNames = [
            'X IPA 1', 'X IPA 2', 'X IPS 1',
            'XI IPA 1', 'XI IPA 2', 'XI IPS 1',
            'XII IPA 1', 'XII IPA 2', 'XII IPS 1', 'XII IPS 2',
        ];

        $classes = collect($classNames)->map(function (string $name, int $i) use ($teachers) {
            $class = SchoolClass::factory()->create([
                'name' => $name,
                'code' => str_replace(' ', '-', $name),
                'homeroom_teacher_id' => $teachers[$i % count($teachers)]->id,
                'academic_year' => '2025/2026',
            ]);

            return $class;
        });

        $this->call(SubjectSeeder::class);
        $this->call(SubjectScheduleSeeder::class);

        // 120 students distributed across classes
        $studentNum = 1;
        foreach ($classes as $class) {
            $count = rand(10, 14);
            for ($j = 0; $j < $count; $j++) {
                User::factory()->student()->create([
                    'school_class_id' => $class->id,
                    'name' => "Siswa {$studentNum}",
                    'email' => "siswa{$studentNum}@example.com",
                ]);
                $studentNum++;
            }
        }

        $this->command->info("Seeded: {$classes->count()} classes, {$teachers->count()} teachers, ".($studentNum - 1).' students');
    }
}
