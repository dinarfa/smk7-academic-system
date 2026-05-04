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
        Schema::create('exam_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->foreignId('answer_option_id')->nullable()->constrained('answer_options')->nullOnDelete();
            $table->text('response_text')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->decimal('points_awarded', 8, 2)->nullable();
            $table->timestamps();

            $table->unique(['exam_attempt_id', 'question_id']);
            $table->index(['question_id', 'answer_option_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_responses');
    }
};
