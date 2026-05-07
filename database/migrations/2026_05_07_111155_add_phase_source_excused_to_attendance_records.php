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
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->enum('phase', ['morning', 'subject', 'dismissal'])->nullable()->after('status');
            $table->enum('source', ['qr_scan', 'manual', 'system'])->nullable()->after('phase');
            $table->boolean('excused')->default(false)->after('source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->dropColumn(['phase', 'source', 'excused']);
        });
    }
};
