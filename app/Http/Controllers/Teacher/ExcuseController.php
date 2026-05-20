<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Excuse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ExcuseController extends Controller
{
    /**
     * Display a list of pending excuses for the teacher's students.
     */
    public function index(): InertiaResponse
    {
        Gate::authorize('viewAny', Excuse::class);

        $teacher = auth()->user();

        // Get all excuses for students in teacher's classes
        $excuses = Excuse::query()
            ->whereHas('student', function ($query) use ($teacher) {
                $query->whereIn('school_class_id',
                    $teacher->homeroomClasses()->pluck('id')
                );
            })
            ->with(['student', 'attendanceRecord', 'submittedBy', 'reviewedBy'])
            ->orderBy('status')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('teacher/excuses/index', [
            'excuses' => $excuses,
        ]);
    }

    /**
     * Show a single excuse for review.
     */
    public function show(Excuse $excuse): InertiaResponse
    {
        Gate::authorize('view', $excuse);

        $excuse->load(['student', 'attendanceRecord', 'submittedBy', 'reviewedBy']);

        return Inertia::render('teacher/excuses/show', [
            'excuse' => $excuse,
        ]);
    }

    /**
     * Approve an excuse.
     */
    public function approve(Excuse $excuse): RedirectResponse
    {
        Gate::authorize('update', $excuse);

        $excuse->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'review_notes' => request('review_notes'),
        ]);

        // Mark attendance record as excused
        if ($excuse->attendance_record_id) {
            $excuse->attendanceRecord->update(['excused' => true]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Izin telah disetujui.'),
        ]);

        return back();
    }

    /**
     * Reject an excuse.
     */
    public function reject(Excuse $excuse): RedirectResponse
    {
        Gate::authorize('update', $excuse);

        $excuse->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'review_notes' => request('review_notes'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Izin telah ditolak.'),
        ]);

        return back();
    }
}
