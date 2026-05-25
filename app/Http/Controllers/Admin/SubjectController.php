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
            ->with(['teacher:id,name', 'schoolClasses:id,name'])
            ->select(['id', 'code', 'name', 'teacher_id', 'created_at', 'updated_at'])
            ->latest('id')
            ->paginate(10)
            ->through(fn (Subject $subject): array => [
                'id' => $subject->id,
                'code' => $subject->code,
                'name' => $subject->name,
                'school_classes' => $subject->schoolClasses->map(fn (SchoolClass $class): array => [
                    'id' => $class->id,
                    'name' => $class->name,
                ])->values(),
                'teacher' => $subject->teacher ? [
                    'id' => $subject->teacher->id,
                    'name' => $subject->teacher->name,
                ] : null,
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
                'school_class_ids' => $subject->schoolClasses->pluck('id')->toArray(),
                'teacher_id' => $subject->teacher_id,
            ],
        ]);
    }

    /**
     * Store a newly created subject.
     */
    public function store(StoreSubjectRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $classIds = $validated['school_class_ids'];
        unset($validated['school_class_ids']);

        $subject = Subject::query()->create($validated);
        $subject->schoolClasses()->attach($classIds);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Subject created successfully.')]);

        return to_route('admin.subjects.index');
    }

    /**
     * Update the specified subject.
     */
    public function update(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        $validated = $request->validated();
        $classIds = $validated['school_class_ids'] ?? null;
        unset($validated['school_class_ids']);

        $subject->update($validated);

        if ($classIds !== null) {
            $subject->schoolClasses()->sync($classIds);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Subject updated successfully.')]);

        return to_route('admin.subjects.index');
    }

    /**
     * Remove the specified subject.
     */
    public function destroy(Subject $subject): RedirectResponse
    {
        $subject->schoolClasses()->detach();
        $subject->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Subject deleted successfully.')]);

        return to_route('admin.subjects.index');
    }
}
