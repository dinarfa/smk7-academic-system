<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSchoolClassRequest;
use App\Http\Requests\Admin\UpdateSchoolClassRequest;
use App\Models\Department;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolClassController extends Controller
{
    /**
     * Show all school classes and creation form.
     */
    public function index(Request $request): Response
    {
        $query = SchoolClass::query()
            ->with(['homeroomTeacher:id,name,email', 'department:id,name,code'])
            ->withCount('students');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $classes = $query
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (SchoolClass $schoolClass): array => [
                'id' => $schoolClass->id,
                'name' => $schoolClass->name,
                'grade_level' => $schoolClass->grade_level,
                'section' => $schoolClass->section,
                'code' => $schoolClass->code,
                'academic_year' => $schoolClass->academic_year,
                'students_count' => $schoolClass->students_count,
                'homeroom_teacher' => [
                    'id' => $schoolClass->homeroomTeacher?->id,
                    'name' => $schoolClass->homeroomTeacher?->name,
                    'email' => $schoolClass->homeroomTeacher?->email,
                ],
                'department' => $schoolClass->department ? [
                    'id' => $schoolClass->department->id,
                    'name' => $schoolClass->department->name,
                    'code' => $schoolClass->department->code,
                ] : null,
            ]);

        $teachers = User::query()
            ->where('role', UserRole::Teacher)
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get();

        $departments = Department::query()
            ->select(['id', 'name', 'code'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/classes/index', [
            'classes' => $classes,
            'teachers' => $teachers->map(fn (User $teacher): array => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
            ])->values(),
            'departments' => $departments->map(fn (Department $dept): array => [
                'id' => $dept->id,
                'name' => $dept->name,
                'code' => $dept->code,
            ])->values(),
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    /**
     * Store a newly generated class.
     */
    public function store(StoreSchoolClassRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Auto-generate class name: "{grade_level} {department_code} {section}"
        $department = Department::find($validated['department_id']);
        $validated['name'] = "{$validated['grade_level']} {$department->code} {$validated['section']}";

        SchoolClass::query()->create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data kelas berhasil digenerate oleh admin.')]);

        return back();
    }

    /**
     * Update a school class.
     */
    public function update(UpdateSchoolClassRequest $request, SchoolClass $schoolClass): RedirectResponse
    {
        $validated = $request->validated();

        // Re-generate class name
        $department = Department::find($validated['department_id']);
        $validated['name'] = "{$validated['grade_level']} {$department->code} {$validated['section']}";

        $schoolClass->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data kelas berhasil diperbarui.')]);

        return back();
    }

    /**
     * Delete a school class.
     */
    public function destroy(SchoolClass $schoolClass): RedirectResponse
    {
        $schoolClass->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Kelas berhasil dihapus.')]);

        return back();
    }
}
