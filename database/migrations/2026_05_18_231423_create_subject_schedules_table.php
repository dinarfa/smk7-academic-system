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
        Schema::create('subject_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('schedule_type'); // morning, subject, dismissal
            $table->unsignedTinyInteger('day_of_week'); // 0=Sun, 1=Mon … 6=Sat
            $table->time('starts_at');
            $table->time('ends_at');
            $table->timestamps();

            $table->index(['school_class_id', 'day_of_week']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subject_schedules');
    }
};
