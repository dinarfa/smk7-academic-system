<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreStudentRequest;
use App\Http\Requests\Teacher\UpdateStudentRequest;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Show students list for teachers and admins.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user?->isAdmin() ?? false;

        $studentsQuery = User::query()
            ->with('schoolClass:id,name')
            ->where('role', UserRole::Student);

        if (! $isAdmin) {
            $homeroomClassIds = $user?->homeroomClasses()->pluck('school_classes.id') ?? collect();

            $studentsQuery->when(
                $homeroomClassIds->isNotEmpty(),
                fn ($query) => $query->whereIn('school_class_id', $homeroomClassIds),
                fn ($query) => $query->whereRaw('1 = 0')
            );
        }

        $students = $studentsQuery
            ->latest()
            ->paginate(10)
            ->through(fn (User $student): array => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'school_class_id' => $student->school_class_id,
                'school_class_name' => $student->schoolClass?->name,
                'created_at' => $student->created_at?->toIso8601String(),
            ]);

        $schoolClassesQuery = $isAdmin
            ? SchoolClass::query()->select(['id', 'name', 'code', 'academic_year'])->withCount('students')->latest('id')
            : $user?->homeroomClasses()->select(['id', 'name', 'code', 'academic_year'])->withCount('students')->latest('id');

        $schoolClasses = ($schoolClassesQuery?->get() ?? collect())
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'code' => $c->code,
                'academic_year' => $c->academic_year,
                'students_count' => $c->students_count,
            ])->values();

        return Inertia::render('teacher/students', [
            'canManageStudents' => $isAdmin,
            'schoolClasses' => $schoolClasses,
            'students' => $students,
        ]);
    }

    /**
     * Store a new student.
     */
    public function store(StoreStudentRequest $request): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        User::query()->create([
            ...$request->validated(),
            'role' => UserRole::Student,
            'email_verified_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data siswa berhasil ditambahkan.')]);

        return back();
    }

    /**
     * Update an existing student.
     */
    public function update(UpdateStudentRequest $request, User $student): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        if (! $student->isStudent()) {
            abort(404);
        }

        $validated = $request->validated();

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $student->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data siswa berhasil diperbarui.')]);

        return back();
    }

    /**
     * Delete a student account.
     */
    public function destroy(Request $request, User $student): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        if (! $student->isStudent()) {
            abort(404);
        }

        $student->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data siswa berhasil dihapus.')]);

        return back();
    }
}
