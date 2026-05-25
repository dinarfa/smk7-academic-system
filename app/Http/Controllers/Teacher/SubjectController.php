<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectSchedule;
use Carbon\Carbon;
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
            ->select(['id', 'code', 'name'])
            ->with(['schoolClasses:id,name'])
            ->where('teacher_id', $teacherId)
            ->orderBy('name')
            ->get();

        // Load schedules for these subjects to avoid N+1 queries and
        // pick the earliest schedule as the representative "waktu pelajaran".
        $schedules = SubjectSchedule::query()
            ->whereIn('subject_id', $subjects->pluck('id')->all())
            ->orderBy('starts_at')
            ->get()
            ->groupBy('subject_id');

        $subjects = $subjects->map(function (Subject $subject) use ($schedules): array {
            $group = $schedules->get($subject->id);
            if (! $group || $group->isEmpty()) {
                $scheduleTime = null;
            } else {
                $slot = $group->first();
                $starts = $slot->starts_at;
                $ends = $slot->ends_at;

                if (is_string($starts) && strlen($starts) === 5) {
                    $starts = $starts.':00';
                }
                if (is_string($ends) && strlen($ends) === 5) {
                    $ends = $ends.':00';
                }

                try {
                    $s = Carbon::createFromFormat('H:i:s', $starts)->format('H:i');
                } catch (\Exception $e) {
                    $s = $starts;
                }

                try {
                    $e = Carbon::createFromFormat('H:i:s', $ends)->format('H:i');
                } catch (\Exception $e2) {
                    $e = $ends;
                }

                $scheduleTime = sprintf('%s – %s', $s, $e);

                // Map day_of_week (0=Sunday) to Indonesian day name
                $dayMap = [
                    0 => 'Minggu',
                    1 => 'Senin',
                    2 => 'Selasa',
                    3 => 'Rabu',
                    4 => 'Kamis',
                    5 => 'Jumat',
                    6 => 'Sabtu',
                ];

                $scheduleDay = isset($slot->day_of_week) && array_key_exists($slot->day_of_week, $dayMap)
                    ? $dayMap[$slot->day_of_week]
                    : null;
            }

            return [
                'id' => $subject->id,
                'code' => $subject->code,
                'name' => $subject->name,
                'class' => $subject->schoolClasses->pluck('name')->join(', '),
                'schedule_time' => $scheduleTime,
                'schedule_day' => $scheduleDay ?? null,
            ];
        });

        return Inertia::render('teacher/subjects/index', [
            'subjects' => $subjects,
        ]);
    }
}
