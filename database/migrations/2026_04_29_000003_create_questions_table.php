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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->longText('prompt');
            $table->string('type')->default('multiple_choice');
            $table->unsignedInteger('points')->default(1);
            $table->unsignedInteger('sort_order')->default(0);
            $table->text('explanation')->nullable();
            $table->timestamps();

            $table->index(['exam_id', 'sort_order']);
            $table->index(['exam_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
