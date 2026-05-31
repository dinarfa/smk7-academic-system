<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Seed subjects and attach them to classes with teachers on pivot.
     *
     * - General subjects (department_id = null): diajarkan di semua kelas
     * - Department-specific subjects: hanya untuk jurusan tertentu
     */
    public function run(): void
    {
        // Mapel umum (berlaku untuk semua jurusan)
        $generalSubjects = [
            'Matematika',
            'Bahasa Indonesia',
            'Bahasa Inggris',
            'Pendidikan Agama',
            'PJOK',
            'Sejarah',
        ];

        // Mapel jurusan
        $departmentSubjects = [
            'TKJ' => ['Jaringan Dasar', 'Administrasi Server', 'Teknik Digital'],
            'RPL' => ['Pemrograman Web', 'Basis Data', 'Pemrograman Berorientasi Objek'],
            'AKL' => ['Akuntansi Dasar', 'Komputer Akuntansi', 'Ekonomi Bisnis'],
            'MM' => ['Desain Grafis', 'Animasi 2D', 'Produksi Multimedia'],
        ];

        $classes = SchoolClass::query()->orderBy('id')->get();
        $teachers = User::query()->where('role', 'teacher')->orderBy('id')->get();

        if ($classes->isEmpty() || $teachers->isEmpty()) {
            $this->command?->warn('SubjectSeeder skipped: classes or teachers missing.');

            return;
        }

        $classIds = $classes->pluck('id')->toArray();
        $pairIndex = 0;
        $subjectCount = 0;

        // Seed mapel umum → semua kelas
        foreach ($generalSubjects as $index => $subjectName) {
            $subject = Subject::firstOrCreate(
                ['name' => $subjectName],
                ['department_id' => null],
            );

            // Attach ke semua kelas
            $existingIds = $subject->schoolClasses()->pluck('school_classes.id')->toArray();
            $newIds = array_diff($classIds, $existingIds);
            if (! empty($newIds)) {
                $teacherId = $teachers[$index % $teachers->count()]->id;
                $attachData = [];
                foreach ($newIds as $classId) {
                    $attachData[$classId] = ['teacher_id' => $teacherId];
                }
                $subject->schoolClasses()->attach($attachData);
            }

            $subjectCount++;
        }

        // Seed mapel jurusan → hanya kelas jurusan terkait
        foreach ($departmentSubjects as $deptCode => $subjects) {
            $department = Department::where('code', $deptCode)->first();
            if (! $department) {
                continue;
            }

            $deptClassIds = $classes->where('department_id', $department->id)->pluck('id')->toArray();

            foreach ($subjects as $subjectName) {
                $subject = Subject::firstOrCreate(
                    ['name' => $subjectName],
                    ['department_id' => $department->id],
                );

                $existingIds = $subject->schoolClasses()->pluck('school_classes.id')->toArray();
                $newIds = array_diff($deptClassIds, $existingIds);
                if (! empty($newIds)) {
                    $teacherId = $teachers[$pairIndex % $teachers->count()]->id;
                    $attachData = [];
                    foreach ($newIds as $classId) {
                        $attachData[$classId] = ['teacher_id' => $teacherId];
                    }
                    $subject->schoolClasses()->attach($attachData);
                }

                $pairIndex++;
                $subjectCount++;
            }
        }

        $this->command?->info("Seeded {$subjectCount} subjects (".count($generalSubjects).' umum + '.array_sum(array_map('count', $departmentSubjects))." jurusan) across {$classes->count()} classes.");
    }
}
