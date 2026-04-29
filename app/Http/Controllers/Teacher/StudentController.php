<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreStudentRequest;
use App\Http\Requests\Teacher\UpdateStudentRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Show students list for teachers.
     */
    public function index(Request $request): Response
    {
        $schoolClass = $request->user()
            ->homeroomClasses()
            ->withCount('students')
            ->first();

        $students = User::query()
            ->where('role', UserRole::Student)
            ->when($schoolClass, fn ($query) => $query->where('school_class_id', $schoolClass->id), fn ($query) => $query->whereRaw('1 = 0'))
            ->latest()
            ->paginate(10)
            ->through(fn (User $student): array => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'school_class_name' => $student->schoolClass?->name,
                'created_at' => $student->created_at?->toIso8601String(),
            ]);

        return Inertia::render('teacher/students', [
            'schoolClass' => $schoolClass ? [
                'id' => $schoolClass->id,
                'name' => $schoolClass->name,
                'code' => $schoolClass->code,
                'academic_year' => $schoolClass->academic_year,
                'students_count' => $schoolClass->students_count,
            ] : null,
            'students' => $students,
        ]);
    }

    /**
     * Store a new student.
     */
    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $schoolClass = $request->user()->homeroomClasses()->firstOrFail();

        User::query()->create([
            ...$request->validated(),
            'role' => UserRole::Student,
            'school_class_id' => $schoolClass->id,
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
        if (! $student->isStudent()) {
            abort(404);
        }

        $schoolClass = $request->user()->homeroomClasses()->firstOrFail();

        if ($student->school_class_id !== $schoolClass->id) {
            abort(403);
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
        if (! $student->isStudent()) {
            abort(404);
        }

        if ($student->school_class_id !== $request->user()->homeroomClasses()->value('id')) {
            abort(403);
        }

        $student->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data siswa berhasil dihapus.')]);

        return back();
    }
}
