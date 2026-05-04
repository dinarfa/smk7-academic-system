<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubjectRequest;
use App\Http\Requests\Admin\UpdateSubjectRequest;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    /**
     * Show subject list and create form.
     */
    public function index(): Response
    {
        $classes = SchoolClass::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $teachers = User::query()
            ->select(['id', 'name', 'email'])
            ->where('role', UserRole::Teacher)
            ->orderBy('name')
            ->get();

        $subjects = Subject::query()
            ->select(['id', 'code', 'name', 'created_at', 'updated_at'])
            ->latest('id')
            ->paginate(10)
            ->through(fn (Subject $subject): array => [
                'id' => $subject->id,
                'code' => $subject->code,
                'name' => $subject->name,
                'created_at' => $subject->created_at?->toIso8601String(),
                'updated_at' => $subject->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/subjects/index', [
            'classes' => $classes,
            'teachers' => $teachers,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Show the edit form for a subject.
     */
    public function edit(Subject $subject): Response
    {
        $classes = SchoolClass::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $teachers = User::query()
            ->select(['id', 'name', 'email'])
            ->where('role', UserRole::Teacher)
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/subjects/edit', [
            'classes' => $classes,
            'teachers' => $teachers,
            'subject' => [
                'id' => $subject->id,
                'code' => $subject->code,
                'name' => $subject->name,
                'school_class_id' => $subject->school_class_id,
                'teacher_id' => $subject->teacher_id,
            ],
        ]);
    }

    /**
     * Store a newly created subject.
     */
    public function store(StoreSubjectRequest $request): RedirectResponse
    {
        Subject::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Subject created successfully.')]);

        return to_route('admin.subjects.index');
    }

    /**
     * Update the specified subject.
     */
    public function update(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        $subject->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Subject updated successfully.')]);

        return to_route('admin.subjects.index');
    }

    /**
     * Remove the specified subject.
     */
    public function destroy(Subject $subject): RedirectResponse
    {
        $subject->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Subject deleted successfully.')]);

        return to_route('admin.subjects.index');
    }
}
