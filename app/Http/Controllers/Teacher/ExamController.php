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

    /**
     * Publish an exam.
     * Only exams in draft status can be published.
     */
    public function publish(Exam $exam): RedirectResponse
    {
        $this->authorize('update', $exam);

        if ($exam->status !== 'draft') {
            return back()->with('error', 'Only draft exams can be published.');
        }

        $exam->update([
            'status' => 'active',
        ]);

        return back()->with('success', "Exam '{$exam->title}' published.");
    }

    /**
     * Unpublish an exam.
     */
    public function unpublish(Exam $exam): RedirectResponse
    {
        $this->authorize('update', $exam);

        if ($exam->status === 'draft') {
            return back()->with('error', 'Only active exams can be unpublished.');
        }

        $exam->update([
            'status' => 'draft',
        ]);

        return back()->with('success', "Exam '{$exam->title}' moved back to draft.");
    }

    /**
     * Show student results for an exam.
     */
    public function results(Exam $exam): Response
    {
        $this->authorize('view', $exam);

        $attempts = $exam->attempts()
            ->with('student:id,name')
            ->latest()
            ->get()
            ->map(fn ($attempt) => [
                'id' => $attempt->id,
                'student_name' => $attempt->student?->name,

                'status' => $attempt->status,
                'score' => $attempt->score,
                'started_at' => $attempt->started_at?->toIso8601String(),
                'submitted_at' => $attempt->submitted_at?->toIso8601String(),
            ]);

        return Inertia::render('teacher/exams/results', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
            ],
            'attempts' => $attempts,
        ]);
    }

    /**
     * Show the correction page for a specific attempt.
     */
    public function correction(Exam $exam, \App\Models\ExamAttempt $attempt): Response
    {
        $this->authorize('view', $exam);

        if ($attempt->exam_id !== $exam->id) {
            abort(404);
        }

        $attempt->load('student:id,name');

        $questions = $exam->questions()->with('answerOptions')->get();
        $attachedQuestions = $exam->attachedQuestions()->with('answerOptions')->get();

        $allQuestions = $questions->concat($attachedQuestions)->sortBy('sort_order')->values();
        $responses = $attempt->responses()->with('answerOption')->get()->keyBy('question_id');

        $mappedQuestions = $allQuestions->map(function ($q) use ($responses) {
            $resp = $responses->get($q->id);
            return [
                'id' => $q->id,
                'prompt' => $q->prompt,
                'type' => $q->type,
                'points' => (float) $q->points,
                'answer_options' => $q->answerOptions->map(fn($opt) => [
                    'id' => $opt->id,
                    'option_text' => $opt->option_text,
                    'is_correct' => $opt->is_correct,
                ]),
                'response' => $resp ? [
                    'id' => $resp->id,
                    'response_text' => $resp->response_text,
                    'answer_option_id' => $resp->answer_option_id,
                    'is_correct' => $resp->is_correct,
                    'points_awarded' => $resp->points_awarded !== null ? (float) $resp->points_awarded : null,
                ] : null,
            ];
        });

        return Inertia::render('teacher/exams/correction', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'student_name' => $attempt->student?->name,
                'status' => $attempt->status,
                'score' => $attempt->score,
            ],
            'questions' => $mappedQuestions,
        ]);
    }

    /**
     * Update the points for an attempt.
     */
    public function updateCorrection(\Illuminate\Http\Request $request, Exam $exam, \App\Models\ExamAttempt $attempt): RedirectResponse
    {
        $this->authorize('update', $exam);

        if ($attempt->exam_id !== $exam->id) {
            abort(404);
        }

        $validated = $request->validate([
            'grades' => ['required', 'array'],
            'grades.*.question_id' => ['required', 'integer', 'exists:questions,id'],
            'grades.*.points_awarded' => ['required', 'numeric', 'min:0'],
        ]);

        foreach ($validated['grades'] as $grade) {
            \App\Models\ExamResponse::updateOrCreate(
                ['exam_attempt_id' => $attempt->id, 'question_id' => $grade['question_id']],
                ['points_awarded' => $grade['points_awarded']]
            );
        }

        // Recalculate total score
        $totalPointsAwarded = $attempt->responses()->sum('points_awarded');
        $directPoints = $exam->questions()->sum('points');
        $attachedPoints = $exam->attachedQuestions()->sum('points');
        $totalPossiblePoints = $directPoints + $attachedPoints;

        $normalizedScore = 0;
        if ($totalPossiblePoints > 0) {
            $normalizedScore = ($totalPointsAwarded / $totalPossiblePoints) * 100;
        }

        $attempt->update(['score' => $normalizedScore]);

        return redirect()->route('teacher.exams.results', $exam)->with('success', 'Nilai berhasil disimpan dan dikalkulasi ulang.');
    }

    /**
     * Export exam results as CSV.
     */
    public function export(Exam $exam)
    {
        $this->authorize('view', $exam);

        $attempts = $exam->attempts()->with('student')->latest()->get();

        $filename = "hasil_ujian_{$exam->id}_" . date('Y-m-d') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($attempts) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['No', 'Nama Siswa', 'Status', 'Waktu Mulai', 'Waktu Selesai', 'Nilai']);

            foreach ($attempts as $index => $attempt) {
                fputcsv($file, [
                    $index + 1,
                    $attempt->student?->name ?? 'Unknown',
                    $attempt->status,
                    $attempt->started_at?->format('Y-m-d H:i:s') ?? '-',
                    $attempt->submitted_at?->format('Y-m-d H:i:s') ?? '-',
                    $attempt->score ?? 0,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
