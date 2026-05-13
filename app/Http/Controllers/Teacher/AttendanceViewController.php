<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\ExportAttendanceRequest;
use App\Services\Attendance\AbsenceDetectionService;
use App\Services\Attendance\AttendanceReportService;
use App\Services\Attendance\DailyAttendanceViewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AttendanceViewController extends Controller
{
    /**
     * Show daily attendance page for teacher.
     */
    public function index(DailyAttendanceViewService $service): InertiaResponse
    {
        Gate::authorize('viewDaily');

        $date = today()->format('Y-m-d');
        $attendance = $service->getByDate($date, auth()->id());
        $activeSession = $service->getActiveSession(auth()->id());

        return Inertia::render('teacher/attendance/index', [
            'attendance' => $attendance,
            'active_session' => $activeSession,
            'date' => $date,
        ]);
    }

    /**
     * Get class students for manual attendance.
     */
    public function classStudents(): JsonResponse
    {
        Gate::authorize('viewDaily');

        $teacher = auth()->user();
        $students = $teacher
            ->homeroomClasses()
            ->with('students')
            ->get()
            ->flatMap(fn ($class) => $class->students)
            ->map(fn ($student) => [
                'id' => $student->id,
                'name' => $student->name,
            ])
            ->values()
            ->toArray();

        return response()->json([
            'students' => $students,
        ]);
    }

    /**
     * Get daily attendance data for teacher.
     */
    public function daily(DailyAttendanceViewService $service): JsonResponse
    {
        Gate::authorize('viewDaily');

        $date = request('date', today()->format('Y-m-d'));
        $attendance = $service->getByDate($date, auth()->id());
        $activeSession = $service->getActiveSession(auth()->id());

        return response()->json([
            'attendance' => $attendance,
            'active_session' => $activeSession,
            'date' => $date,
        ]);
    }

    public function bolosSummary(AbsenceDetectionService $service): JsonResponse
    {
        Gate::authorize('viewDaily');

        $date = request('date', today()->format('Y-m-d'));
        $summary = $service->summaryForTeacherOnDate(auth()->id(), $date);

        return response()->json([
            'summary' => $summary,
            'date' => $date,
        ]);
    }

    /**
     * Export teacher attendance as CSV.
     */
    public function export(
        ExportAttendanceRequest $request,
        AttendanceReportService $service,
    ): SymfonyResponse {
        Gate::authorize('viewDaily');

        $validated = $request->validated();
        $format = $validated['format'] ?? 'csv';

        if ($format === 'xlsx') {
            $rows = $service->exportArrayForTeacher(
                $request->user()->id,
                $validated['startDate'],
                $validated['endDate'],
            );

            $tempPath = tempnam(sys_get_temp_dir(), 'attendance_export_');
            abort_if($tempPath === false, 500, 'Unable to create temporary export file.');

            $writer = new Writer();
            $writer->openToFile($tempPath);

            foreach ($rows as $row) {
                $writer->addRow(Row::fromValues($row));
            }

            $writer->close();

            $filename = 'teacher-attendance-export-'.now()->format('Y-m-d-His').'.xlsx';

            return response()->download(
                $tempPath,
                $filename,
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ],
            )->deleteFileAfterSend(true);
        }

        // Fallback to CSV download
        $csv = $service->exportCsvForTeacher(
            $request->user()->id,
            $validated['startDate'],
            $validated['endDate'],
        );

        $filename = 'teacher-attendance-export-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(
            static function () use ($csv): void {
                echo $csv;
            },
            $filename,
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }
}
