<?php

namespace App\Models;

use App\Enums\AttendanceQrType;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class SubjectSchedule extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'school_class_id',
        'subject_id',
        'schedule_type',
        'day_of_week',
        'starts_at',
        'ends_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'starts_at' => 'string',
            'ends_at' => 'string',
        ];
    }

    /**
     * The school class this schedule slot belongs to.
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    /**
     * The subject for this slot (null for morning/dismissal).
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Scope: slots that are active right now for the given time.
     *
     * @param  Builder<SubjectSchedule>  $query
     * @return Builder<SubjectSchedule>
     */
    public function scopeActiveNow(Builder $query, ?CarbonInterface $at = null): Builder
    {
        $at ??= now();

        return $query
            ->where('day_of_week', $at->dayOfWeek)
            ->whereTime('starts_at', '<=', $at->format('H:i:s'))
            ->whereTime('ends_at', '>=', $at->format('H:i:s'));
    }

    /**
     * Scope: all slots for a given day of week.
     *
     * @param  Builder<SubjectSchedule>  $query
     * @return Builder<SubjectSchedule>
     */
    public function scopeForDay(Builder $query, int $dayOfWeek): Builder
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    /**
     * Find the closest schedule slot to the given time for a class.
     * Used when a student scans outside any active slot window.
     */
    public static function findClosestSlot(int $schoolClassId, ?CarbonInterface $at = null): ?self
    {
        $at ??= now();
        $timeString = $at->format('H:i:s');

        // First try: exact match (currently inside a slot)
        $exact = static::query()
            ->where('school_class_id', $schoolClassId)
            ->where('day_of_week', $at->dayOfWeek)
            ->whereTime('starts_at', '<=', $timeString)
            ->whereTime('ends_at', '>=', $timeString)
            ->first();

        if ($exact) {
            return $exact;
        }

        // Second: find the closest slot by comparing end times (past slots) and start times (future slots)
        $allSlots = static::query()
            ->where('school_class_id', $schoolClassId)
            ->where('day_of_week', $at->dayOfWeek)
            ->orderBy('starts_at')
            ->get();

        if ($allSlots->isEmpty()) {
            return null;
        }

        $closest = null;
        $smallestDiff = PHP_INT_MAX;

        foreach ($allSlots as $slot) {
            // Normalize stored time strings to H:i:s so Carbon parsing is safe
            $starts = $slot->starts_at;
            $ends = $slot->ends_at;

            if (is_string($starts) && strlen($starts) === 5) { // H:i -> append seconds
                $starts = $starts.':00';
            }

            if (is_string($ends) && strlen($ends) === 5) { // H:i -> append seconds
                $ends = $ends.':00';
            }

            try {
                $slotStart = Carbon::createFromFormat('H:i:s', $starts, $at->timezone);
            } catch (\Exception $e) {
                $slotStart = Carbon::parse($starts, $at->timezone);
            }

            try {
                $slotEnd = Carbon::createFromFormat('H:i:s', $ends, $at->timezone);
            } catch (\Exception $e) {
                $slotEnd = Carbon::parse($ends, $at->timezone);
            }

            // Use the nearest edge of the slot
            $diffToStart = abs($at->diffInSeconds($slotStart->copy()->setDate($at->year, $at->month, $at->day)));
            $diffToEnd = abs($at->diffInSeconds($slotEnd->copy()->setDate($at->year, $at->month, $at->day)));
            $diff = min($diffToStart, $diffToEnd);

            if ($diff < $smallestDiff) {
                $smallestDiff = $diff;
                $closest = $slot;
            }
        }

        return $closest;
    }

    /**
     * Resolve the most relevant slot for a class at the given time.
     *
     * Preference:
     * 1. Active slot right now.
     * 2. Before the first slot today -> first slot.
     * 3. After the last slot today -> last slot.
     * 4. Between slots -> closest slot edge.
     */
    public static function resolveForClassNow(int $schoolClassId, ?CarbonInterface $at = null): ?self
    {
        $at ??= now();

        return static::query()
            ->where('school_class_id', $schoolClassId)
            ->activeNow($at)
            ->with('subject:id,code,name')
            ->first();
    }

    /**
     * Resolve all active schedule slots for a teacher at the given time.
     *
     * @return Collection<int, self>
     */
    public static function activeForTeacherNow(User $teacher, ?CarbonInterface $at = null): Collection
    {
        $at ??= now();

        $classIds = $teacher->homeroomClasses()
            ->pluck('school_classes.id')
            ->merge($teacher->subjects()->pluck('school_class_id'))
            ->filter()
            ->unique()
            ->values();

        if ($classIds->isEmpty()) {
            return collect();
        }

        return static::query()
            ->whereIn('school_class_id', $classIds->all())
            ->activeNow($at)
            ->with(['subject:id,code,name', 'schoolClass:id,name'])
            ->orderBy('starts_at')
            ->get();
    }

    /**
     * Resolve the AttendanceQrType from the schedule_type string.
     */
    public function resolveQrType(): AttendanceQrType
    {
        return match ($this->schedule_type) {
            'morning' => AttendanceQrType::Morning,
            'dismissal' => AttendanceQrType::Dismissal,
            default => AttendanceQrType::Subject,
        };
    }
}
