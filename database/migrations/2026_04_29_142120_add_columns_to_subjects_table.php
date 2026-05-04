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
        Schema::table('subjects', function (Blueprint $table) {
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete()->after('id');
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete()->after('school_class_id');
            $table->text('description')->nullable()->after('name');
            $table->boolean('is_active')->default(true)->after('description');
            $table->unique(['school_class_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropUnique(['school_class_id', 'name']);
            $table->dropForeignIdFor('SchoolClass');
            $table->dropForeignIdFor('User');
            $table->dropColumn(['description', 'is_active']);
        });
    }
};
