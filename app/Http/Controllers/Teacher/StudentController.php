<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreStudentRequest;
use App\Http\Requests\Teacher\UpdateStudentRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Show students list for teachers.
     */
    public function index(): Response
    {
        $students = User::query()
            ->where('role', UserRole::Student)
            ->latest()
            ->paginate(10)
            ->through(fn (User $student): array => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'created_at' => $student->created_at?->toIso8601String(),
            ]);

        return Inertia::render('teacher/students', [
            'students' => $students,
        ]);
    }

    /**
     * Store a new student.
     */
    public function store(StoreStudentRequest $request): RedirectResponse
    {
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
    public function destroy(User $student): RedirectResponse
    {
        if (! $student->isStudent()) {
            abort(404);
        }

        $student->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Data siswa berhasil dihapus.')]);

        return back();
    }
}
