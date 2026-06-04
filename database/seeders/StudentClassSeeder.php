<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentClassSeeder extends Seeder
{
    public function run(): void
    {
        // 10 teachers (1 per class for homeroom)
        $teachers = User::factory()
            ->count(10)
            ->teacher()
            ->create()
            ->each(fn (User $t, int $i) => $t->update([
                'name' => "Guru {$i}",
                'email' => "guru{$i}@example.com",
            ]));

        // Load departments (must be seeded by DepartmentSeeder first)
        $tkj = Department::where('code', 'TKJ')->firstOrFail();
        $rpl = Department::where('code', 'RPL')->firstOrFail();
        $akl = Department::where('code', 'AKL')->firstOrFail();
        $mm = Department::where('code', 'MM')->firstOrFail();

        // 10 classes: grade_level + department + section
        $classDefinitions = [
            ['grade_level' => 'X',  'department' => $tkj, 'section' => 1],
            ['grade_level' => 'X',  'department' => $rpl, 'section' => 1],
            ['grade_level' => 'X',  'department' => $akl, 'section' => 1],
            ['grade_level' => 'XI', 'department' => $tkj, 'section' => 1],
            ['grade_level' => 'XI', 'department' => $rpl, 'section' => 1],
            ['grade_level' => 'XI', 'department' => $mm,  'section' => 1],
            ['grade_level' => 'XII', 'department' => $tkj, 'section' => 1],
            ['grade_level' => 'XII', 'department' => $rpl, 'section' => 1],
            ['grade_level' => 'XII', 'department' => $akl, 'section' => 1],
            ['grade_level' => 'XII', 'department' => $mm,  'section' => 1],
        ];

        $classes = collect($classDefinitions)->map(function (array $def, int $i) use ($teachers) {
            $name = "{$def['grade_level']} {$def['department']->code} {$def['section']}";

            return SchoolClass::firstOrCreate(
                ['name' => $name],
                [
                    'code' => str_replace(' ', '-', $name),
                    'homeroom_teacher_id' => $teachers[$i]->id,
                    'department_id' => $def['department']->id,
                    'grade_level' => $def['grade_level'],
                    'section' => $def['section'],
                    'academic_year' => '2025/2026',
                ],
            );
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
