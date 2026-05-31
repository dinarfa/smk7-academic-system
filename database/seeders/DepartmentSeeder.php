<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Teknik Komputer dan Jaringan', 'code' => 'TKJ', 'description' => 'Kompetensi keahlian di bidang jaringan komputer dan administrasi sistem.'],
            ['name' => 'Rekayasa Perangkat Lunak', 'code' => 'RPL', 'description' => 'Kompetensi keahlian di bidang pengembangan software dan aplikasi.'],
            ['name' => 'Akuntansi dan Keuangan Lembaga', 'code' => 'AKL', 'description' => 'Kompetensi keahlian di bidang akuntansi dan keuangan.'],
            ['name' => 'Multimedia', 'code' => 'MM', 'description' => 'Kompetensi keahlian di bidang desain grafis, animasi, dan produksi multimedia.'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(
                ['code' => $dept['code']],
                $dept,
            );
        }

        $this->command?->info('Seeded '.count($departments).' departments.');
    }
}
