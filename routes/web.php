<?php

use App\Http\Controllers\Admin\AdminAuditLogController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\SchoolClassController as AdminSchoolClassController;
use App\Http\Controllers\Admin\SubjectController as AdminSubjectController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Student\AttendanceController as StudentAttendanceController;
use App\Http\Controllers\Teacher\AttendanceSessionController;
use App\Http\Controllers\Teacher\SchoolClassController;
use App\Http\Controllers\Teacher\StudentController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        // Class generation
        Route::get('classes', [AdminSchoolClassController::class, 'index'])->name('classes.index');
        Route::post('classes', [AdminSchoolClassController::class, 'store'])->name('classes.store');

        // Subject management
        Route::get('subjects', [AdminSubjectController::class, 'index'])->name('subjects.index');
        Route::post('subjects', [AdminSubjectController::class, 'store'])->name('subjects.store');
        Route::get('subjects/{subject}/edit', [AdminSubjectController::class, 'edit'])->name('subjects.edit');
        Route::put('subjects/{subject}', [AdminSubjectController::class, 'update'])->name('subjects.update');
        Route::delete('subjects/{subject}', [AdminSubjectController::class, 'destroy'])->name('subjects.destroy');

        // User management
        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('users/{user}', [AdminUserController::class, 'show'])->name('users.show');
        Route::get('users/{user}/reset-password', [AdminUserController::class, 'showResetForm'])->name('users.reset-password');
        Route::post('users/{user}/reset-password', [AdminUserController::class, 'resetPassword'])->name('users.reset-password.store');

        // Reports
        Route::get('reports/overview', [AdminReportController::class, 'overview'])->name('reports.overview');
        Route::get('reports/by-session', [AdminReportController::class, 'bySession'])->name('reports.by-session');
        Route::get('reports/by-student', [AdminReportController::class, 'byStudent'])->name('reports.by-student');
        Route::get('reports/export', [AdminReportController::class, 'export'])->name('reports.export');

        // Audit logs
        Route::get('audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('audit-logs/{auditLog}', [AdminAuditLogController::class, 'show'])->name('audit-logs.show');
    });

    Route::middleware('role:teacher')->prefix('teacher')->name('teacher.')->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('class', [SchoolClassController::class, 'index'])->name('class.index');

        Route::get('students', [StudentController::class, 'index'])->name('students.index');
        Route::post('students', [StudentController::class, 'store'])->name('students.store');
        Route::put('students/{student}', [StudentController::class, 'update'])->name('students.update');
        Route::delete('students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

        Route::post('attendance-sessions', [AttendanceSessionController::class, 'store'])->name('attendance-sessions.store');
        Route::patch('attendance-sessions/{attendanceSession}/close', [AttendanceSessionController::class, 'close'])->name('attendance-sessions.close');
    });

    Route::middleware('role:student')->prefix('student')->name('student.')->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('attendance', [StudentAttendanceController::class, 'index'])->name('attendance.index');
        Route::post('attendance/scan', [StudentAttendanceController::class, 'scan'])->name('attendance.scan');
    });
});

require __DIR__.'/settings.php';
