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
     * The teacher who teaches this subject slot (resolved via subject).
     */
    public function teacher(): ?User
    {
        return $this->subject?->teacher;
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
     * Uses DB-level queries instead of loading all slots into PHP.
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

        // Find the nearest future slot (starts after current time)
        $future = static::query()
            ->where('school_class_id', $schoolClassId)
            ->where('day_of_week', $at->dayOfWeek)
            ->whereTime('starts_at', '>=', $timeString)
            ->orderBy('starts_at')
            ->first();

        // Find the nearest past slot (ends before current time)
        $past = static::query()
            ->where('school_class_id', $schoolClassId)
            ->where('day_of_week', $at->dayOfWeek)
            ->whereTime('ends_at', '<=', $timeString)
            ->orderByDesc('ends_at')
            ->first();

        if (! $future && ! $past) {
            return null;
        }

        if (! $future) {
            return $past;
        }

        if (! $past) {
            return $future;
        }

        // Both exist — pick the closest by time difference
        $futureDiff = abs($at->copy()->setTimeFromTimeString($future->starts_at)->diffInSeconds($at));
        $pastDiff = abs($at->copy()->setTimeFromTimeString($past->ends_at)->diffInSeconds($at));

        return $futureDiff <= $pastDiff ? $future : $past;
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
     * Homeroom teachers see ALL active slots for their classes.
     * Subject teachers see only their own subject slots + morning/dismissal
     * for non-homeroom classes they teach in.
     *
     * @return Collection<int, self>
     */
    public static function activeForTeacherNow(User $teacher, ?CarbonInterface $at = null): Collection
    {
        $at ??= now();
        $version = cache()->get('teacher_schedules_version', 1);
        $cacheKey = "teacher_schedules:{$version}:{$teacher->id}:day_{$at->dayOfWeek}:hour_{$at->format('H')}";

        return cache()->remember($cacheKey, 300, function () use ($teacher, $at) {
            // 1. Homeroom classes: teacher sees ALL active slots
            $homeroomClassIds = $teacher->homeroomClasses()->pluck('school_classes.id');

            $homeroomSlots = collect();
            if ($homeroomClassIds->isNotEmpty()) {
                $homeroomSlots = static::query()
                    ->whereIn('school_class_id', $homeroomClassIds->all())
                    ->activeNow($at)
                    ->with(['subject:id,code,name', 'schoolClass:id,name'])
                    ->get();
            }

            // 2. Subject-taught classes (non-homeroom): only teacher's own subjects + morning/dismissal
            $subjectClassIds = $teacher->subjects()
                ->join('class_subjects', 'subjects.id', '=', 'class_subjects.subject_id')
                ->pluck('class_subjects.school_class_id')
                ->filter()
                ->unique();
            $teacherSubjectIds = $teacher->subjects()->pluck('subjects.id');
            $nonHomeroomSubjectClassIds = $subjectClassIds->diff($homeroomClassIds);

            $subjectSlots = collect();
            if ($nonHomeroomSubjectClassIds->isNotEmpty()) {
                $subjectSlots = static::query()
                    ->whereIn('school_class_id', $nonHomeroomSubjectClassIds->all())
                    ->activeNow($at)
                    ->where(function ($q) use ($teacherSubjectIds) {
                        $q->whereNull('subject_id')
                            ->orWhereIn('subject_id', $teacherSubjectIds->all());
                    })
                    ->with(['subject:id,code,name', 'schoolClass:id,name'])
                    ->get();
            }

            return $homeroomSlots->merge($subjectSlots)
                ->sortBy('starts_at')
                ->values();
        });
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
