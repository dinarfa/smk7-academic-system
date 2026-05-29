<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('class_subjects', function (Blueprint $table) {
            $table->foreignId('teacher_id')->nullable()->after('school_class_id')
                ->constrained('users')->nullOnDelete();
            $table->unique(['subject_id', 'school_class_id', 'teacher_id']);
        });

        // Drop old unique constraint (subject_id, school_class_id)
        Schema::table('class_subjects', function (Blueprint $table) {
            $table->dropUnique(['subject_id', 'school_class_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_subjects', function (Blueprint $table) {
            $table->dropUnique(['subject_id', 'school_class_id', 'teacher_id']);
            $table->dropConstrainedForeignId('teacher_id');
            $table->unique(['subject_id', 'school_class_id']);
        });
    }
};
