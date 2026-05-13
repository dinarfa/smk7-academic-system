<?php

use App\Http\Controllers\Admin\AdminAuditLogController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\SchoolClassController as AdminSchoolClassController;
use App\Http\Controllers\Admin\SubjectController as AdminSubjectController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Student\AttendanceController as StudentAttendanceController;
use App\Http\Controllers\Student\ExamAttemptController;
use App\Http\Controllers\Student\ExamController as StudentExamController;
use App\Http\Controllers\Student\ExamResponseController;
use App\Http\Controllers\Student\ExamSubmissionController;
use App\Http\Controllers\Student\ExcuseController as StudentExcuseController;
use App\Http\Controllers\Teacher\AttendanceSessionController;
use App\Http\Controllers\Teacher\AttendanceViewController;
use App\Http\Controllers\Teacher\ExamController;
use App\Http\Controllers\Teacher\ExcuseController as TeacherExcuseController;
use App\Http\Controllers\Teacher\QuestionController;
use App\Http\Controllers\Teacher\SchoolClassController;
use App\Http\Controllers\Teacher\StudentController;
use App\Http\Controllers\Teacher\SubjectController;
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
        Route::get('subjects', [SubjectController::class, 'index'])->name('subjects.index');

        Route::get('students', [StudentController::class, 'index'])->name('students.index');
        Route::post('students', [StudentController::class, 'store'])->name('students.store');
        Route::put('students/{student}', [StudentController::class, 'update'])->name('students.update');
        Route::delete('students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

        Route::post('attendance-sessions', [AttendanceSessionController::class, 'store'])->name('attendance-sessions.store');
        Route::patch('attendance-sessions/{attendanceSession}/close', [AttendanceSessionController::class, 'close'])->name('attendance-sessions.close');
        Route::post('attendance/manual', [AttendanceSessionController::class, 'storeManual'])->name('attendance.manual');
        Route::get('attendance/daily', [AttendanceViewController::class, 'daily'])->name('attendance.daily');
        Route::get('attendance/bolos-summary', [AttendanceViewController::class, 'bolosSummary'])->name('attendance.bolos-summary');
        Route::get('class-students', [AttendanceViewController::class, 'classStudents'])->name('class-students');
        Route::post('attendance/export', [AttendanceViewController::class, 'export'])->name('attendance.export');
        Route::get('attendance', [AttendanceViewController::class, 'index'])->name('attendance.index');

        // Exam management
        Route::get('exams', [ExamController::class, 'index'])->name('exams.index');
        Route::get('exams/create', [ExamController::class, 'create'])->name('exams.create');
        Route::post('exams', [ExamController::class, 'store'])->name('exams.store');
        Route::patch('exams/{exam}/publish', [ExamController::class, 'publish'])->name('exams.publish');
        Route::patch('exams/{exam}/unpublish', [ExamController::class, 'unpublish'])->name('exams.unpublish');
        Route::get('exams/{exam}/results', [ExamController::class, 'results'])->name('exams.results');
        Route::get('exams/{exam}/attempts/{attempt}/correction', [ExamController::class, 'correction'])->name('exams.attempts.correction');
        Route::put('exams/{exam}/attempts/{attempt}/correction', [ExamController::class, 'updateCorrection'])->name('exams.attempts.updateCorrection');
        Route::get('exams/{exam}/export', [ExamController::class, 'export'])->name('exams.export');

        // Exam questions
        Route::get('exams/{exam}/questions', [QuestionController::class, 'index'])->name('exams.questions.index');
        Route::get('exams/{exam}/questions/create', [QuestionController::class, 'create'])->name('exams.questions.create');
        Route::post('exams/{exam}/questions', [QuestionController::class, 'store'])->name('exams.questions.store');
        Route::post('exams/{exam}/questions/attach', [QuestionController::class, 'attach'])->name('exams.questions.attach');
        Route::get('exams/{exam}/questions/{question}/edit', [QuestionController::class, 'edit'])->name('exams.questions.edit');
        Route::put('exams/{exam}/questions/{question}', [QuestionController::class, 'update'])->name('exams.questions.update');
        Route::delete('exams/{exam}/questions/{question}', [QuestionController::class, 'destroy'])->name('exams.questions.destroy');

        // Excuse management - teacher reviews
        Route::get('excuses', [TeacherExcuseController::class, 'index'])->name('excuses.index');
        Route::get('excuses/{excuse}', [TeacherExcuseController::class, 'show'])->name('excuses.show');
        Route::patch('excuses/{excuse}/approve', [TeacherExcuseController::class, 'approve'])->name('excuses.approve');
        Route::patch('excuses/{excuse}/reject', [TeacherExcuseController::class, 'reject'])->name('excuses.reject');
    });

    Route::middleware('role:student')->prefix('student')->name('student.')->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('attendance', [StudentAttendanceController::class, 'index'])->name('attendance.index');
        Route::post('attendance/scan', [StudentAttendanceController::class, 'scan'])->name('attendance.scan');
        Route::get('exams', [StudentExamController::class, 'index'])->name('exams.index');
        // Student exam attempts
        Route::post('exams/{exam}/attempts', [ExamAttemptController::class, 'store'])->name('exams.attempts.store');
        Route::get('exams/{exam}/attempts/{attempt}', [ExamAttemptController::class, 'show'])->name('exams.attempts.show');
        // Save / autosave exam responses
        Route::post('exams/{exam}/attempts/{attempt}/responses', [ExamResponseController::class, 'store'])
            ->name('exams.attempts.responses.store');
        // Final submission of an attempt — locks further changes
        Route::post('exams/{exam}/attempts/{attempt}/submit', [ExamSubmissionController::class, 'store'])
            ->name('exams.attempts.submit');

        // Excuse management - student submits
        Route::get('excuses', [StudentExcuseController::class, 'index'])->name('excuses.index');
        Route::get('excuses/create', [StudentExcuseController::class, 'create'])->name('excuses.create');
        Route::post('excuses', [StudentExcuseController::class, 'store'])->name('excuses.store');
        Route::get('excuses/{excuse}', [StudentExcuseController::class, 'show'])->name('excuses.show');
    });
});

require __DIR__.'/settings.php';
