<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreExamRequest;
use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of exams created by the teacher.
     */
    public function index(): Response
    {
        $exams = Exam::where('created_by', auth()->id())
            ->with('subject', 'class')
            ->latest()
            ->paginate(15)
            ->through(fn (Exam $exam) => [
                'id' => $exam->id,
                'title' => $exam->title,
                'subject' => $exam->subject?->name,
                'class' => $exam->class?->name,
                'duration_minutes' => $exam->duration_minutes,
                'status' => $exam->status,
                'created_at' => $exam->created_at?->toDateString(),
            ]);

        return Inertia::render('teacher/exams/index', [
            'exams' => $exams,
        ]);
    }

    /**
     * Show the form for creating a new exam.
     */
    public function create(): Response
    {
        $subjects = Subject::with('schoolClass')
            ->get()
            ->groupBy('school_class_id')
            ->map(fn ($subjectsInClass) => $subjectsInClass->map(fn (Subject $subject) => [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_id' => $subject->school_class_id,
            ])->values())
            ->values();

        $classes = SchoolClass::select('id', 'name', 'code')
            ->orderBy('name')
            ->get();

        return Inertia::render('teacher/exams/create', [
            'subjects' => $subjects,
            'classes' => $classes,
        ]);
    }

    /**
     * Store a newly created exam in storage.
     */
    public function store(StoreExamRequest $request): RedirectResponse
    {
        $exam = Exam::create([
            'title' => $request->validated('title'),
            'subject_id' => $request->validated('subject_id'),
            'class_id' => $request->validated('class_id'),
            'duration_minutes' => $request->validated('duration_minutes'),
            'instructions' => $request->validated('instructions'),
            'created_by' => auth()->id(),
            'status' => 'draft',
        ]);

        return redirect()->route('teacher.exams.index')
            ->with('success', "Exam '{$exam->title}' created successfully.");
    }
}
