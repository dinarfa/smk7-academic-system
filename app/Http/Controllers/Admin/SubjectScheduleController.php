<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubjectScheduleRequest;
use App\Http\Requests\Admin\UpdateSubjectScheduleRequest;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\SubjectSchedule;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubjectScheduleController extends Controller
{
    /**
     * Show the schedule management page.
     */
    public function index(): Response
    {
        $classes = SchoolClass::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $subjects = Subject::query()
            ->select(['id', 'name', 'school_class_id'])
            ->orderBy('name')
            ->get();

        $schedules = SubjectSchedule::query()
            ->with(['schoolClass:id,name', 'subject:id,name'])
            ->orderBy('school_class_id')
            ->orderBy('day_of_week')
            ->orderBy('starts_at')
            ->get()
            ->map(fn (SubjectSchedule $schedule): array => [
                'id' => $schedule->id,
                'school_class_id' => $schedule->school_class_id,
                'school_class_name' => $schedule->schoolClass?->name,
                'subject_id' => $schedule->subject_id,
                'subject_name' => $schedule->subject?->name,
                'schedule_type' => $schedule->schedule_type,
                'day_of_week' => $schedule->day_of_week,
                'starts_at' => $schedule->starts_at,
                'ends_at' => $schedule->ends_at,
            ]);

        return Inertia::render('admin/schedules/index', [
            'classes' => $classes,
            'subjects' => $subjects,
            'schedules' => $schedules,
        ]);
    }

    /**
     * Store a new schedule slot.
     */
    public function store(StoreSubjectScheduleRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Ensure subject_id is only set for 'subject' type
        if ($validated['schedule_type'] !== 'subject') {
            $validated['subject_id'] = null;
        }

        SubjectSchedule::query()->create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Jadwal berhasil ditambahkan.')]);

        return back();
    }

    /**
     * Update an existing schedule slot.
     */
    public function update(UpdateSubjectScheduleRequest $request, SubjectSchedule $subjectSchedule): RedirectResponse
    {
        $validated = $request->validated();

        if (isset($validated['schedule_type']) && $validated['schedule_type'] !== 'subject') {
            $validated['subject_id'] = null;
        }

        $subjectSchedule->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Jadwal berhasil diperbarui.')]);

        return back();
    }

    /**
     * Delete a schedule slot.
     */
    public function destroy(SubjectSchedule $subjectSchedule): RedirectResponse
    {
        $subjectSchedule->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Jadwal berhasil dihapus.')]);

        return back();
    }
}
