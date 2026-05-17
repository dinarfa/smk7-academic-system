<?php

namespace App\Models;

use App\Enums\AttendanceQrType;
use BaconQrCode\Renderer\Color\Rgb;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\Fill;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceSession extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'opened_by',
        'type',
        'subject',
        'subject_id',
        'qr_token',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AttendanceQrType::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Teacher who opened this attendance session.
     */
    public function openedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    /**
     * Subject linked to this session (if type=subject).
     */
    public function subjectModel(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * Resolved subject name: from relationship or legacy text field.
     */
    public function getSubjectNameAttribute(): ?string
    {
        return $this->subjectModel?->name ?? $this->subject;
    }

    /**
     * Attendance records for this session.
     */
    public function records(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    /**
     * Payload embedded into the QR code.
     */
    public function qrPayload(): string
    {
        return 'attendance:'.$this->qr_token;
    }

    /**
     * Render QR code SVG from this session payload.
     */
    public function qrSvg(): string
    {
        $svg = (new Writer(
            new ImageRenderer(
                new RendererStyle(260, 0, null, null, Fill::uniformColor(new Rgb(255, 255, 255), new Rgb(30, 41, 59))),
                new SvgImageBackEnd
            )
        ))->writeString($this->qrPayload());

        return trim(substr($svg, strpos($svg, "\n") + 1));
    }
}
