<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Create pivot table
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['subject_id', 'school_class_id']);
        });

        // Step 2: Migrate existing data from subjects.school_class_id to pivot
        DB::statement('INSERT INTO class_subjects (subject_id, school_class_id, created_at, updated_at) SELECT id, school_class_id, NOW(), NOW() FROM subjects WHERE school_class_id IS NOT NULL');

        // Step 3: Drop foreign key, unique constraint, and column from subjects
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropForeign(['school_class_id']);
            $table->dropUnique(['school_class_id', 'name']);
            $table->dropColumn('school_class_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore school_class_id column
        Schema::table('subjects', function (Blueprint $table) {
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->cascadeOnDelete()->after('id');
            $table->unique(['school_class_id', 'name']);
        });

        // Migrate data back from pivot to subjects
        DB::statement('UPDATE subjects s INNER JOIN class_subjects cs ON cs.subject_id = s.id SET s.school_class_id = cs.school_class_id');

        Schema::dropIfExists('class_subjects');
    }
};
