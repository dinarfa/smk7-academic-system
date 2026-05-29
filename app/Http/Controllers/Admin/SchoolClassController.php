<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSchoolClassRequest;
use App\Http\Requests\Admin\UpdateSchoolClassRequest;
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
            ->with(['homeroomTeacher:id,name,email'])
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
                'code' => $schoolClass->code,
                'academic_year' => $schoolClass->academic_year,
                'students_count' => $schoolClass->students_count,
                'homeroom_teacher' => [
                    'id' => $schoolClass->homeroomTeacher?->id,
                    'name' => $schoolClass->homeroomTeacher?->name,
                    'email' => $schoolClass->homeroomTeacher?->email,
                ],
            ]);

        $teachers = User::query()
            ->where('role', UserRole::Teacher)
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/classes/index', [
            'classes' => $classes,
            'teachers' => $teachers->map(fn (User $teacher): array => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
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
        SchoolClass::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data kelas berhasil digenerate oleh admin.')]);

        return back();
    }

    /**
     * Update a school class.
     */
    public function update(UpdateSchoolClassRequest $request, SchoolClass $schoolClass): RedirectResponse
    {
        $schoolClass->update($request->validated());

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
