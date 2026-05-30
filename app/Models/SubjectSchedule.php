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
use Illuminate\Support\Facades\DB;

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
     * The teacher who teaches this subject slot (resolved from pivot).
     */
    public function teacher(): ?User
    {
        $subject = $this->subject;
        if (! $subject) {
            return null;
        }

        $pivotTeacherId = $subject->schoolClasses()
            ->where('school_classes.id', $this->school_class_id)
            ->first()?->pivot?->teacher_id;

        return $pivotTeacherId ? User::find($pivotTeacherId) : null;
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
            ->with('subject:id,name')
            ->first();
    }

    /**
     * Resolve all active schedule slots for a teacher at the given time.
     *
     * Homeroom teachers see ALL active slots for their classes.
     * Subject teachers see only their own subject slots + morning/dismissal
     * for non-homeroom classes they teach in.
     *
     * Teacher assignment is resolved via:
     * - class_subjects.pivot.teacher_id (per class)
     *
     * @return Collection<int, self>
     */
    public static function activeForTeacherNow(User $teacher, ?CarbonInterface $at = null): Collection
    {
        $at ??= now();
        $version = cache()->get('teacher_schedules_version', 1);
        $cacheKey = "teacher_schedules:{$version}:{$teacher->id}:day_{$at->dayOfWeek}:hour_{$at->format('H')}";

        // Cache only the IDs to avoid __PHP_Incomplete_Class on deserialization
        $ids = cache()->remember($cacheKey, 300, function () use ($teacher, $at): array {
            // Get all subjects this teacher teaches via pivot
            $teacherPivotSubjectIds = collect(
                DB::table('class_subjects')
                    ->where('teacher_id', $teacher->id)
                    ->pluck('subject_id')
                    ->all(),
            );

            // Get all classes where teacher teaches via pivot
            $teacherClassIds = collect(
                DB::table('class_subjects')
                    ->where('teacher_id', $teacher->id)
                    ->pluck('school_class_id')
                    ->all(),
            );

            // Homeroom classes: teacher sees own subjects + morning/dismissal
            $homeroomClassIds = $teacher->homeroomClasses()->pluck('school_classes.id');

            $allClassIds = $teacherClassIds->merge($homeroomClassIds)->unique();

            if ($allClassIds->isEmpty()) {
                return [];
            }

            return static::query()
                ->whereIn('school_class_id', $allClassIds->all())
                ->activeNow($at)
                ->where(function ($q) use ($teacherPivotSubjectIds): void {
                    // Teacher's own subjects
                    $q->whereIn('subject_id', $teacherPivotSubjectIds->all())
                        // Morning/dismissal slots (no subject)
                        ->orWhereNull('subject_id');
                })
                ->pluck('id')
                ->all();
        });

        if (empty($ids)) {
            return collect();
        }

        return static::query()
            ->whereIn('id', $ids)
            ->with(['subject:id,name', 'schoolClass:id,name'])
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
