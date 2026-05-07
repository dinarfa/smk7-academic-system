<?php

namespace App\Models;

use App\Enums\AttendanceQrType;
use App\Enums\AttendanceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'attendance_session_id',
        'student_id',
        'status',
        'scanned_at',
        'phase',
        'source',
        'excused',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => AttendanceStatus::class,
            'scanned_at' => 'datetime',
            'phase' => AttendanceQrType::class,
            'excused' => 'boolean',
        ];
    }

    /**
     * Parent attendance session.
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }

    /**
     * Student that submitted this attendance.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
