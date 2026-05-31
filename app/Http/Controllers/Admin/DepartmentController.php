<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDepartmentRequest;
use App\Http\Requests\Admin\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    /**
     * Show all departments and creation form.
     */
    public function index(Request $request): Response
    {
        $query = Department::query()
            ->withCount(['schoolClasses', 'subjects']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $departments = $query
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Department $department): array => [
                'id' => $department->id,
                'name' => $department->name,
                'code' => $department->code,
                'description' => $department->description,
                'school_classes_count' => $department->school_classes_count,
                'subjects_count' => $department->subjects_count,
            ]);

        return Inertia::render('admin/departments/index', [
            'departments' => $departments,
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    /**
     * Store a newly created department.
     */
    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        Department::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Jurusan berhasil ditambahkan.')]);

        return back();
    }

    /**
     * Update a department.
     */
    public function update(UpdateDepartmentRequest $request, Department $department): RedirectResponse
    {
        $department->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Jurusan berhasil diperbarui.')]);

        return back();
    }

    /**
     * Delete a department.
     */
    public function destroy(Department $department): RedirectResponse
    {
        $department->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Jurusan berhasil dihapus.')]);

        return back();
    }
}
