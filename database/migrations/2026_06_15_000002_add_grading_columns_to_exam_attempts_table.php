<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi.
     */
    public function up(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->timestamp('graded_at')->nullable()->after('score');
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete()->after('graded_at');
            $table->text('feedback')->nullable()->after('graded_by');
        });
    }

    /**
     * Balikkan migrasi.
     */
    public function down(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->dropForeign(['graded_by']);
            $table->dropColumn(['graded_at', 'graded_by', 'feedback']);
        });
    }
};
