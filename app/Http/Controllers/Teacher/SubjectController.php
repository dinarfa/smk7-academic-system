<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    /**
     * Display the subjects assigned to the teacher.
     */
    public function index(Request $request): Response
    {
        $teacherId = $request->user()?->id;

        $subjects = Subject::query()
            ->select(['id', 'name'])
            ->with(['schoolClasses:id,name'])
            ->whereHas('schoolClasses', fn ($q) => $q->where('class_subjects.teacher_id', $teacherId))
            ->orderBy('name')
            ->get();

        // Load all schedule slots for these subjects, grouped by day.
        $schedules = SubjectSchedule::query()
            ->with('schoolClass:id,name')
            ->whereIn('subject_id', $subjects->pluck('id')->all())
            ->orderBy('day_of_week')
            ->orderBy('starts_at')
            ->get()
            ->groupBy('subject_id');

        $dayNames = [
            0 => 'Minggu',
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
        ];

        $subjects = $subjects->map(function (Subject $subject) use ($schedules, $dayNames): array {
            $group = $schedules->get($subject->id);
            $scheduleDays = [];

            if ($group && $group->isNotEmpty()) {
                $byDay = $group->groupBy('day_of_week');

                foreach ($byDay as $day => $slots) {
                    $dayName = $dayNames[$day] ?? "Day {$day}";
                    $slotList = $slots->map(function ($slot) {
                        return [
                            'time' => substr($slot->starts_at, 0, 5).'–'.substr($slot->ends_at, 0, 5),
                            'class' => $slot->schoolClass?->name ?? '-',
                        ];
                    })->values()->all();

                    $scheduleDays[] = [
                        'day' => $dayName,
                        'slots' => $slotList,
                    ];
                }
            }

            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'class' => $subject->schoolClasses->pluck('name')->join(', '),
                'schedule_days' => $scheduleDays,
            ];
        });

        return Inertia::render('teacher/subjects/index', [
            'subjects' => $subjects,
        ]);
    }
}
