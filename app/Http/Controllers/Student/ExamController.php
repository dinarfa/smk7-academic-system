<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    /**
     * Show eligible exams for the authenticated student.
     */
    public function index(Request $request): Response
    {
        $student = $request->user();
        $now = now();

        $exams = Exam::query()
            ->where('class_id', $student->school_class_id)
            ->where('status', 'active')
            ->where(fn ($query) => $query
                ->whereNull('starts_at')
                ->orWhere('starts_at', '<=', $now))
            ->where(fn ($query) => $query
                ->whereNull('ends_at')
                ->orWhere('ends_at', '>=', $now))
            ->with([
                'subject:id,name',
                'attempts' => fn ($query) => $query->where('student_id', $student->id),
            ])
            ->orderBy('starts_at')
            ->paginate(10)
            ->through(function (Exam $exam): array {
                $attempt = $exam->attempts->first();

                return [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'subject' => $exam->subject?->name,
                    'duration_minutes' => $exam->duration_minutes,
                    'starts_at' => $exam->starts_at?->toIso8601String(),
                    'ends_at' => $exam->ends_at?->toIso8601String(),
                    'status' => $exam->status,
                    'attempt' => $attempt ? [
                        'id' => $attempt->id,
                        'status' => $attempt->status,
                        'started_at' => $attempt->started_at?->toIso8601String(),
                        'submitted_at' => $attempt->submitted_at?->toIso8601String(),
                    ] : null,
                    'can_start' => $attempt === null,
                ];
            });

        return Inertia::render('student/exams/index', [
            'exams' => $exams,
        ]);
    }
}
