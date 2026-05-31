<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_classes', function (Blueprint $table): void {
            $table->foreignId('department_id')->nullable()->after('homeroom_teacher_id')->constrained('departments')->nullOnDelete();
            $table->string('grade_level', 10)->nullable()->after('name');
            $table->integer('section')->nullable()->after('grade_level');
        });
    }

    public function down(): void
    {
        Schema::table('school_classes', function (Blueprint $table): void {
            $table->dropForeign(['department_id']);
            $table->dropColumn(['department_id', 'grade_level', 'section']);
        });
    }
};
