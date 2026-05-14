<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolClassController extends Controller
{
    /**
     * Show the homeroom class for the authenticated teacher.
     */
    public function index(Request $request): Response
    {
        $classes = $request->user()
            ->homeroomClasses()
            ->with(['homeroomTeacher:id,name,email', 'students:id,name,email,school_class_id'])
            ->withCount('students')
            ->get();

        return Inertia::render('teacher/class', [
            'schoolClasses' => $classes->map(fn ($schoolClass) => [
                'id' => $schoolClass->id,
                'name' => $schoolClass->name,
                'code' => $schoolClass->code,
                'academic_year' => $schoolClass->academic_year,
                'students_count' => $schoolClass->students_count,
                'homeroom_teacher' => [
                    'id' => $schoolClass->homeroomTeacher?->id,
                    'name' => $schoolClass->homeroomTeacher?->name,
                    'email' => $schoolClass->homeroomTeacher?->email,
                ],
                'students' => $schoolClass->students->map(fn ($student) => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                ])->values(),
            ])->values(),
        ]);
    }
}
