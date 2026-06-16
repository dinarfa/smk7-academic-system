<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateExamStatusRequest;
use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    /**
     * Display a listing of all exams.
     */
    public function index(Request $request): Response
    {
        $query = Exam::query()
            ->with(['subject:id,name', 'class:id,name', 'creator:id,name'])
            ->withCount(['attempts', 'questions']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('created_by')) {
            $query->where('created_by', $request->input('created_by'));
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->input('subject_id'));
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        $exams = $query->latest()->paginate(15)->withQueryString();

        $teachers = User::where('role', 'teacher')
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $subjects = Subject::select(['id', 'name'])->orderBy('name')->get();
        $classes = SchoolClass::select(['id', 'name'])->orderBy('name')->get();

        return Inertia::render('admin/exams/index', [
            'exams' => $exams,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'classes' => $classes,
            'filters' => [
                'status' => $request->input('status'),
                'created_by' => $request->input('created_by'),
                'subject_id' => $request->input('subject_id'),
                'class_id' => $request->input('class_id'),
                'search' => $request->input('search'),
            ],
        ]);
    }

    /**
     * Show exam details with questions grouped by type and attempt statistics.
     */
    public function show(Exam $exam): Response
    {
        $exam->load(['subject:id,name', 'class:id,name', 'creator:id,name']);

        // Questions grouped by type (direct + attached)
        $directQuestions = $exam->questions()->get();
        $attachedQuestions = $exam->attachedQuestions()->get();
        $allQuestions = $directQuestions->concat($attachedQuestions)->sortBy('sort_order')->values();

        $totalQuestions = $allQuestions->count();
        $questionsByType = [
            'multiple_choice' => $allQuestions->where('type', 'multiple_choice')->count(),
            'essay' => $allQuestions->where('type', 'essay')->count(),
        ];

        // Attempt statistics
        $attempts = $exam->attempts()->with('student:id,name')->latest()->get();
        $completedAttempts = $attempts->where('status', 'submitted');
        $gradedAttempts = $attempts->where('status', 'graded');
        $allCompleted = $completedAttempts->merge($gradedAttempts);
        $scores = $allCompleted->pluck('score')->filter()->map(fn ($s) => (float) $s)->values();

        $attemptsStats = [
            'total' => $attempts->count(),
            'submitted' => $completedAttempts->count(),
            'graded' => $gradedAttempts->count(),
            'avg_score' => $scores->count() > 0 ? round($scores->avg(), 1) : null,
            'min_score' => $scores->count() > 0 ? round($scores->min(), 1) : null,
            'max_score' => $scores->count() > 0 ? round($scores->max(), 1) : null,
            'median_score' => $scores->count() > 0 ? round($scores->median(), 1) : null,
        ];

        // Score distribution (buckets of 20)
        $scoreDistribution = collect([
            ['range' => '0-20', 'min' => 0, 'max' => 20],
            ['range' => '21-40', 'min' => 21, 'max' => 40],
            ['range' => '41-60', 'min' => 41, 'max' => 60],
            ['range' => '61-80', 'min' => 61, 'max' => 80],
            ['range' => '81-100', 'min' => 81, 'max' => 100],
        ])->map(fn ($bucket) => [
            'range' => $bucket['range'],
            'count' => $scores->filter(fn ($s) => $s >= $bucket['min'] && $s <= $bucket['max'])->count(),
        ])->values();

        // Recent attempts with duration
        $recentAttempts = $attempts->take(50)->map(fn ($attempt) => [
            'id' => $attempt->id,
            'student_name' => $attempt->student?->name ?? 'Tidak diketahui',
            'status' => $attempt->status,
            'score' => $attempt->score !== null ? round((float) $attempt->score, 1) : null,
            'duration' => $attempt->submitted_at && $attempt->started_at
                ? (int) $attempt->started_at->diffInMinutes($attempt->submitted_at)
                : null,
        ]);

        return Inertia::render('admin/exams/show', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'instructions' => $exam->instructions,
                'duration_minutes' => $exam->duration_minutes,
                'status' => $exam->status,
                'teacher' => $exam->creator?->name ?? '-',
                'subject' => $exam->subject?->name ?? '-',
                'class' => $exam->class?->name ?? '-',
                'total_questions' => $totalQuestions,
                'starts_at' => $exam->starts_at?->toIso8601String(),
                'ends_at' => $exam->ends_at?->toIso8601String(),
            ],
            'questions_by_type' => $questionsByType,
            'attempts_stats' => $attemptsStats,
            'score_distribution' => $scoreDistribution,
            'attempts' => $recentAttempts,
        ]);
    }

    /**
     * Update the status of an exam.
     */
    public function updateStatus(UpdateExamStatusRequest $request, Exam $exam): RedirectResponse
    {
        $exam->update(['status' => $request->validated('status')]);

        return back()->with('success', "Status ujian '{$exam->title}' berhasil diubah.");
    }

    /**
     * Remove an exam from storage.
     */
    public function destroy(Exam $exam): RedirectResponse
    {
        if ($exam->status !== 'draft') {
            return back()->with('error', 'Hanya ujian dengan status draft yang dapat dihapus.');
        }

        if ($exam->attempts()->exists()) {
            return back()->with('error', 'Ujian yang sudah memiliki pengerjaan tidak dapat dihapus.');
        }

        $exam->delete();

        return redirect()->route('admin.exams.index')->with('success', "Ujian '{$exam->title}' berhasil dihapus.");
    }
}
