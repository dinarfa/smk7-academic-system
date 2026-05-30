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
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    /**
     * Show subject list and create form.
     */
    public function index(Request $request): Response
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

        $query = Subject::query()
            ->with(['schoolClasses:id,name'])
            ->select(['id', 'name', 'created_at', 'updated_at']);

        if ($request->filled('teacher_id')) {
            $teacherId = $request->input('teacher_id');
            $query->whereHas('schoolClasses', fn ($q) => $q->where('class_subjects.teacher_id', $teacherId));
        }

        if ($request->filled('class_id')) {
            $classId = $request->input('class_id');
            $query->whereHas('schoolClasses', fn ($q) => $q->where('school_classes.id', $classId));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $subjects = $query
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Subject $subject): array => [
                'id' => $subject->id,
                'name' => $subject->name,
                'school_classes' => $subject->schoolClasses->map(fn (SchoolClass $class): array => [
                    'id' => $class->id,
                    'name' => $class->name,
                    'teacher_id' => $class->pivot->teacher_id,
                ])->values(),
                'created_at' => $subject->created_at?->toIso8601String(),
                'updated_at' => $subject->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/subjects/index', [
            'classes' => $classes,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'filters' => [
                'teacher_id' => $request->input('teacher_id'),
                'class_id' => $request->input('class_id'),
                'search' => $request->input('search'),
            ],
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
                'name' => $subject->name,
                'school_class_ids' => $subject->schoolClasses->pluck('id')->toArray(),
                'class_teachers' => $subject->schoolClasses->mapWithKeys(fn (SchoolClass $class): array => [
                    $class->id => $class->pivot->teacher_id,
                ])->toArray(),
            ],
        ]);
    }

    /**
     * Store a newly created subject.
     */
    public function store(StoreSubjectRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $classIds = $validated['school_class_ids'] ?? [];
        $classTeachers = $validated['class_teachers'] ?? [];
        unset($validated['school_class_ids'], $validated['class_teachers'], $validated['teacher_id']);

        $subject = Subject::query()->create($validated);

        // Attach classes with per-class teacher_id on pivot
        if (! empty($classIds)) {
            $attachData = [];
            foreach ($classIds as $classId) {
                $pivotTeacherId = $classTeachers[$classId] ?? null;
                if ($pivotTeacherId) {
                    $attachData[$classId] = ['teacher_id' => $pivotTeacherId];
                }
            }
            $subject->schoolClasses()->attach($attachData);
        }

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
        $classTeachers = $validated['class_teachers'] ?? [];
        unset($validated['school_class_ids'], $validated['class_teachers'], $validated['teacher_id']);

        $subject->update($validated);

        if ($classIds !== null) {
            // Sync with per-class teacher_id on pivot
            $syncData = [];
            foreach ($classIds as $classId) {
                $pivotTeacherId = $classTeachers[$classId] ?? null;
                if ($pivotTeacherId) {
                    $syncData[$classId] = ['teacher_id' => $pivotTeacherId];
                } else {
                    $syncData[$classId] = ['teacher_id' => null];
                }
            }
            $subject->schoolClasses()->sync($syncData);
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
