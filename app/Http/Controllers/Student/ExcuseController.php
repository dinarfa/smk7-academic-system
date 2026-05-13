<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreExcuseRequest;
use App\Models\Excuse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ExcuseController extends Controller
{
    /**
     * Display excuses for the current student.
     */
    public function index(): InertiaResponse
    {
        $student = auth()->user();

        $excuses = Excuse::query()
            ->where('student_id', $student->id)
            ->with(['attendanceRecord', 'submittedBy', 'reviewedBy'])
            ->latest('created_at')
            ->paginate(20);

        return Inertia::render('student/excuses/index', [
            'excuses' => $excuses,
        ]);
    }

    /**
     * Show form to create new excuse.
     */
    public function create(): InertiaResponse
    {
        // Get student's pending excuses for reference
        $pendingAbsences = auth()->user()
            ->attendanceRecords()
            ->where('status', 'absent')
            ->where('excused', false)
            ->whereDoesntHave('excuse')
            ->with('student', 'session')
            ->latest('scanned_at')
            ->take(10)
            ->get();

        return Inertia::render('student/excuses/create', [
            'pendingAbsences' => $pendingAbsences,
        ]);
    }

    /**
     * Store a new excuse submission.
     */
    public function store(StoreExcuseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Excuse::create([
            'student_id' => auth()->id(),
            'submitted_by' => auth()->id(),
            'attendance_record_id' => $validated['attendance_record_id'] ?? null,
            'type' => $validated['type'],
            'reason' => $validated['reason'],
            'excused_date' => $validated['excused_date'],
            'status' => 'pending',
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Izin telah diajukan. Menunggu persetujuan guru.'),
        ]);

        return redirect()->route('student.excuses.index');
    }

    /**
     * Show detail of a specific excuse.
     */
    public function show(Excuse $excuse): InertiaResponse
    {
        Gate::authorize('view', $excuse);

        $excuse->load(['attendanceRecord', 'submittedBy', 'reviewedBy']);

        return Inertia::render('student/excuses/show', [
            'excuse' => $excuse,
        ]);
    }
}
