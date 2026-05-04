<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Subject;
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
            ->select(['id', 'code', 'name', 'school_class_id'])
            ->with(['schoolClass:id,name'])
            ->where('teacher_id', $teacherId)
            ->orderBy('name')
            ->get()
            ->map(fn (Subject $subject): array => [
                'id' => $subject->id,
                'code' => $subject->code,
                'name' => $subject->name,
                'class' => $subject->schoolClass?->name,
            ]);

        return Inertia::render('teacher/subjects/index', [
            'subjects' => $subjects,
        ]);
    }
}
