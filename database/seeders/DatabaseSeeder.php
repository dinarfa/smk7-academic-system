<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\SchoolClass;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $teacher = User::factory()->create([
            'name' => 'Test User',
            'email' => 'guru@example.com',
            'role' => UserRole::Teacher,
        ]);

        $schoolClass = SchoolClass::query()->create([
            'homeroom_teacher_id' => $teacher->id,
            'name' => 'X IPA 1',
            'code' => 'X-IPA-1',
            'academic_year' => '2026/2027',
        ]);

        User::factory()->create([
            'name' => 'Student User',
            'email' => 'murid@example.com',
            'role' => UserRole::Student,
            'school_class_id' => $schoolClass->id,
        ]);
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => UserRole::Admin,
        ]);
    }
}
