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
        Schema::table('audit_logs', function (Blueprint $table): void {
            $table->index('admin_id');
            $table->index('target_user_id');
            $table->index(['action', 'created_at']);
        });

        Schema::table('excuses', function (Blueprint $table): void {
            $table->index('student_id');
            $table->index('submitted_by');
            $table->index('reviewed_by');
            $table->index('attendance_record_id');
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table): void {
            $table->dropIndex(['admin_id']);
            $table->dropIndex(['target_user_id']);
            $table->dropIndex(['action', 'created_at']);
        });

        Schema::table('excuses', function (Blueprint $table): void {
            $table->dropIndex(['student_id']);
            $table->dropIndex(['submitted_by']);
            $table->dropIndex(['reviewed_by']);
            $table->dropIndex(['attendance_record_id']);
            $table->dropIndex(['status', 'created_at']);
        });
    }
};
