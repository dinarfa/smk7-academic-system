<?php

namespace Database\Factories;

use App\Enums\AttendanceQrType;
use App\Models\AttendanceSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AttendanceSession>
 */
class AttendanceSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'opened_by' => User::factory(),
            'type' => $this->faker->randomElement(AttendanceQrType::cases())->value,
            'subject' => $this->faker->word(),
            'qr_token' => $this->faker->unique()->sha256(),
            'starts_at' => now(),
            'is_active' => true,
        ];
    }
}
