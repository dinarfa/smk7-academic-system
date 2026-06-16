<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\Student\AttendanceController;
use App\Http\Controllers\Api\V1\Student\DashboardController;
use App\Http\Controllers\Api\V1\Student\ExamAttemptController;
use App\Http\Controllers\Api\V1\Student\ExamController;
use App\Http\Controllers\Api\V1\Student\ExamResponseController;
use App\Http\Controllers\Api\V1\Student\ExamSubmissionController;
use App\Http\Controllers\Api\V1\Student\ExcuseController;
use App\Http\Controllers\Api\V1\Student\ProfileController;
use App\Http\Controllers\Api\V1\UploadController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('v1/login', [AuthController::class, 'login']);
Route::post('v1/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('v1/logout', [AuthController::class, 'logout']);
    Route::get('v1/me', [AuthController::class, 'me']);

    // Upload (teacher/admin only)
    Route::middleware('role:teacher,admin')->post('v1/upload/image', [UploadController::class, 'store']);

    // Student routes
    Route::middleware('role:student')->prefix('v1/student')->name('api.student.')->group(function () {
        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Attendance
        Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
        Route::post('attendance/scan', [AttendanceController::class, 'scan'])->name('attendance.scan');

        // Exams
        Route::get('exams', [ExamController::class, 'index'])->name('exams.index');
        Route::post('exams/{exam}/attempts', [ExamAttemptController::class, 'store'])->name('exams.attempts.store');
        Route::get('exams/{exam}/attempts/{attempt}', [ExamAttemptController::class, 'show'])->name('exams.attempts.show');
        Route::post('exams/{exam}/attempts/{attempt}/responses', [ExamResponseController::class, 'store'])->name('exams.attempts.responses.store');
        Route::post('exams/{exam}/attempts/{attempt}/submit', [ExamSubmissionController::class, 'store'])->name('exams.attempts.submit');

        // Excuses
        Route::get('excuses', [ExcuseController::class, 'index'])->name('excuses.index');
        Route::post('excuses', [ExcuseController::class, 'store'])->name('excuses.store');
        Route::get('excuses/{excuse}', [ExcuseController::class, 'show'])->name('excuses.show');

        // Profile
        Route::get('profile', [ProfileController::class, 'show'])->name('profile.show');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    });
});
