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
        Schema::table('questions', function (Blueprint $table) {
            $table->json('prompt_images')->nullable()->after('prompt');
            $table->boolean('has_image')->default(false)->after('prompt_images');
        });

        Schema::table('answer_options', function (Blueprint $table) {
            $table->json('option_images')->nullable()->after('option_text');
            $table->boolean('has_image')->default(false)->after('option_images');
        });
    }

    /**
     * Balikkan migrasi.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['prompt_images', 'has_image']);
        });

        Schema::table('answer_options', function (Blueprint $table) {
            $table->dropColumn(['option_images', 'has_image']);
        });
    }
};
