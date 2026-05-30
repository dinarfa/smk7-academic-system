<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\ExportAttendanceRequest;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\SchoolClass;
use App\Models\SubjectSchedule;
use Illuminate\Support\Facades\DB;
use App\Services\Attendance\AbsenceDetectionService;
use App\Services\Attendance\AttendanceReportService;
use App\Services\Attendance\DailyAttendanceViewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
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
            'active_session' => $this->mapSession($activeSession),
            'date' => $date,
        ]);
    }

    /**
     * Show the dedicated QR display page for the current attendance session.
     */
    public function qr(DailyAttendanceViewService $service): InertiaResponse
    {
        Gate::authorize('viewDaily');

        $teacher = auth()->user();
        $session = $service->getActiveSession($teacher->id);

        $activeSchedules = SubjectSchedule::activeForTeacherNow($teacher);

        $subjectGroups = $activeSchedules
            ->filter(fn (SubjectSchedule $schedule) => $schedule->subject_id !== null)
            ->groupBy(fn (SubjectSchedule $schedule) => $schedule->subject?->id.'::'.$schedule->subject?->name)
            ->map(function ($schedulesInGroup, $subjectKey) {
                $firstSchedule = $schedulesInGroup->first();

                return [
                    'key' => $subjectKey,
                    'name' => $firstSchedule?->subject?->name,
                    'classes' => $schedulesInGroup
                        ->map(fn (SubjectSchedule $schedule) => [
                            'id' => $schedule->school_class_id,
                            'name' => $schedule->schoolClass?->name,
                        ])
                        ->filter(fn ($class) => filled($class['name']))
                        ->unique('id')
                        ->values(),
                ];
            })
            ->values();

        $accessibleClasses = $activeSchedules
            ->map(fn (SubjectSchedule $schedule) => [
                'id' => $schedule->school_class_id,
                'name' => $schedule->schoolClass?->name,
            ])
            ->filter(fn ($class) => filled($class['name']))
            ->unique('id')
            ->values();

        // Prioritize schedule with a subject assigned (teacher's own subject)
        $currentSchedule = $activeSchedules->firstWhere('subject_id', '!==', null)
            ?? $activeSchedules->first();

        return Inertia::render('teacher/attendance/qr', [
            'active_session' => $this->mapSession($session),
            'current_schedule' => $currentSchedule ? [
                'type' => $currentSchedule->schedule_type,
                'subject_name' => $currentSchedule->subject?->name,
                'class_name' => $currentSchedule->schoolClass?->name,
                'starts_at' => $currentSchedule->starts_at,
                'ends_at' => $currentSchedule->ends_at,
                'day_of_week' => $currentSchedule->day_of_week,
            ] : null,
            'subject_groups' => $subjectGroups,
            'accessible_classes' => $accessibleClasses,
        ]);
    }

    /**
     * Get class students for manual attendance.
     */
    public function classStudents(): JsonResponse
    {
        Gate::authorize('viewDaily');

        $teacher = auth()->user();

        // Homeroom classes: full access
        $homeroomClasses = $teacher->homeroomClasses()->with('students')->get();

        // Subject-taught classes (non-homeroom): access to students in those classes
        $subjectClassIds = $teacher->teachingSubjects()
            ->pluck('class_subjects.school_class_id')
            ->filter()
            ->unique()
            ->diff($homeroomClasses->pluck('id'));

        // Also include classes where teacher is assigned via pivot
        $pivotClassIds = DB::table('class_subjects')
            ->where('teacher_id', $teacher->id)
            ->pluck('school_class_id')
            ->diff($homeroomClasses->pluck('id'));

        $nonHomeroomClassIds = $subjectClassIds->merge($pivotClassIds)->unique();

        $subjectClasses = collect();
        if ($nonHomeroomClassIds->isNotEmpty()) {
            $subjectClasses = SchoolClass::query()
                ->whereIn('id', $nonHomeroomClassIds->all())
                ->with('students')
                ->get();
        }

        $allClasses = $homeroomClasses->merge($subjectClasses);

        $students = $allClasses
            ->flatMap(fn ($class) => $class->students->map(fn ($student) => [
                'id' => $student->id,
                'name' => $student->name,
                'class_id' => $class->id,
                'class_name' => $class->name,
            ]))
            ->values()
            ->toArray();

        return response()->json([
            'students' => $students,
            'classes' => $allClasses->map(fn ($class) => [
                'id' => $class->id,
                'name' => $class->name,
            ])->values()->toArray(),
        ]);
    }

    /**
     * Show dedicated manual attendance page.
     */
    public function manual(DailyAttendanceViewService $service): InertiaResponse
    {
        Gate::authorize('viewDaily');

        $teacher = auth()->user();
        $date = today()->format('Y-m-d');

        // Get active schedules for subject/class selection (same as QR page)
        $activeSchedules = SubjectSchedule::activeForTeacherNow($teacher);

        $subjectGroups = $activeSchedules
            ->filter(fn (SubjectSchedule $schedule) => $schedule->subject_id !== null)
            ->groupBy(fn (SubjectSchedule $schedule) => $schedule->subject?->id.'::'.$schedule->subject?->name)
            ->map(function ($schedulesInGroup, $subjectKey) {
                $firstSchedule = $schedulesInGroup->first();

                return [
                    'key' => $subjectKey,
                    'name' => $firstSchedule?->subject?->name,
                    'classes' => $schedulesInGroup
                        ->map(fn (SubjectSchedule $schedule) => [
                            'id' => $schedule->school_class_id,
                            'name' => $schedule->schoolClass?->name,
                        ])
                        ->filter(fn ($class) => filled($class['name']))
                        ->unique('id')
                        ->values(),
                ];
            })
            ->values();

        $accessibleClasses = $activeSchedules
            ->map(fn (SubjectSchedule $schedule) => [
                'id' => $schedule->school_class_id,
                'name' => $schedule->schoolClass?->name,
            ])
            ->filter(fn ($class) => filled($class['name']))
            ->unique('id')
            ->values();

        $currentSchedule = $activeSchedules->firstWhere('subject_id', '!==', null)
            ?? $activeSchedules->first();

        // All students from accessible classes (for manual marking)
        $allClasses = SchoolClass::query()
            ->whereIn('id', $accessibleClasses->pluck('id')->all())
            ->with('students')
            ->get();

        $students = $allClasses
            ->flatMap(fn ($class) => $class->students->map(fn ($student) => [
                'id' => $student->id,
                'name' => $student->name,
                'class_id' => $class->id,
                'class_name' => $class->name,
            ]))
            ->values();

        $existingRecords = AttendanceRecord::query()
            ->whereHas('session', fn ($q) => $q->where('opened_by', $teacher->id))
            ->whereDate('scanned_at', $date)
            ->get()
            ->mapWithKeys(fn ($record) => [
                $record->student_id => [
                    'status' => $record->status->value ?? $record->status,
                    'phase' => $record->phase?->value ?? $record->phase,
                    'source' => $record->source,
                ],
            ]);

        $activeSession = $service->getActiveSession($teacher->id);

        return Inertia::render('teacher/attendance/manual', [
            'students' => $students,
            'subject_groups' => $subjectGroups,
            'accessible_classes' => $accessibleClasses,
            'current_schedule' => $currentSchedule ? [
                'type' => $currentSchedule->schedule_type,
                'subject_name' => $currentSchedule->subject?->name,
                'class_name' => $currentSchedule->schoolClass?->name,
                'starts_at' => $currentSchedule->starts_at,
                'ends_at' => $currentSchedule->ends_at,
            ] : null,
            'existingRecords' => $existingRecords,
            'activeSession' => $this->mapSession($activeSession),
            'date' => $date,
        ]);
    }

    /**
     * Get daily attendance data for teacher.
     */
    public function daily(DailyAttendanceViewService $service): JsonResponse|InertiaResponse
    {
        Gate::authorize('viewDaily');

        $date = request('date', today()->format('Y-m-d'));
        $attendance = $service->getByDate($date, auth()->id());
        $activeSession = $service->getActiveSession(auth()->id());

        if (! request()->expectsJson()) {
            return Inertia::render('teacher/attendance/daily', [
                'attendance' => $attendance,
                'active_session' => $this->mapSession($activeSession),
                'date' => $date,
            ]);
        }

        return response()->json([
            'attendance' => $attendance,
            'active_session' => $this->mapSession($activeSession),
            'date' => $date,
        ]);
    }

    /**
     * Normalize an attendance session into page-friendly props.
     */
    private function mapSession(?AttendanceSession $session): ?array
    {
        if ($session === null) {
            return null;
        }

        return [
            'id' => $session->id,
            'type' => $session->type?->value,
            'subject' => $session->subject,
            'subject_id' => $session->subject_id,
            'subject_name' => $session->subject_name,
            'starts_at' => $session->starts_at?->toIso8601String(),
            'ends_at' => $session->ends_at?->toIso8601String(),
            'is_active' => $session->is_active,
            'records_count' => $session->records()->count(),
            'qr_payload' => $session->qrPayload(),
            'qr_svg' => $session->qrSvg(),
            'qr_expires_at' => $session->qr_expires_at?->toIso8601String(),
        ];
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
     * Show attendance recap page with date range filter.
     */
    public function recap(DailyAttendanceViewService $service, Request $request): InertiaResponse
    {
        Gate::authorize('viewDaily');

        $startDate = $request->query('start_date', now()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());
        $teacherId = auth()->id();

        $records = $service->getRecap($startDate, $endDate, $teacherId);

        return Inertia::render('teacher/attendance/recap', [
            'records' => $records,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    /**
     * Show the export attendance page.
     */
    public function exportPage(): InertiaResponse
    {
        Gate::authorize('viewDaily');

        $teacher = auth()->user();

        $homeroomClasses = $teacher->homeroomClasses()->get();

        // Subject-taught classes via default teacher_id
        $subjectClassIds = $teacher->teachingSubjects()
            ->pluck('class_subjects.school_class_id')
            ->filter()
            ->unique()
            ->diff($homeroomClasses->pluck('id'));

        // Also include classes where teacher is assigned via pivot
        $pivotClassIds = DB::table('class_subjects')
            ->where('teacher_id', $teacher->id)
            ->pluck('school_class_id')
            ->diff($homeroomClasses->pluck('id'));

        $nonHomeroomClassIds = $subjectClassIds->merge($pivotClassIds)->unique();

        $subjectClasses = $nonHomeroomClassIds->isNotEmpty()
            ? SchoolClass::query()->whereIn('id', $nonHomeroomClassIds->all())->get()
            : collect();

        $allClasses = $homeroomClasses->merge($subjectClasses);

        $subjects = $teacher->teachingSubjects()
            ->select('subjects.id', 'subjects.name', 'class_subjects.school_class_id')
            ->get();

        return Inertia::render('teacher/attendance/export', [
            'schoolClasses' => $allClasses->map(fn ($class) => [
                'id' => $class->id,
                'name' => $class->name,
            ])->values(),
            'subjects' => $subjects->map(fn ($subject) => [
                'id' => $subject->id,
                'name' => $subject->name,
                'school_class_id' => $subject->pivot->school_class_id,
            ])->values(),
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
        $classId = $validated['classId'] ?? null;
        $subjectId = $validated['subjectId'] ?? null;

        if ($format === 'xlsx') {
            $data = $service->exportFormattedForTeacher(
                $request->user()->id,
                $validated['startDate'],
                $validated['endDate'],
                $classId,
                $subjectId,
            );

            $tempPath = tempnam(sys_get_temp_dir(), 'attendance_export_');
            abort_if($tempPath === false, 500, 'Unable to create temporary export file.');

            // Styles
            $headerStyle = new \OpenSpout\Common\Entity\Style\Style(
                fontBold: true,
                fontSize: 11,
                fontColor: \OpenSpout\Common\Entity\Style\Color::WHITE,
                backgroundColor: '#3B82F6',
            );

            $presentStyle = new \OpenSpout\Common\Entity\Style\Style(
                backgroundColor: '#DCFCE7',
                fontColor: '#166534',
            );

            $absentStyle = new \OpenSpout\Common\Entity\Style\Style(
                backgroundColor: '#FEE2E2',
                fontColor: '#991B1B',
            );

            $lateStyle = new \OpenSpout\Common\Entity\Style\Style(
                backgroundColor: '#FEF9C3',
                fontColor: '#854D0E',
            );

            $titleStyle = new \OpenSpout\Common\Entity\Style\Style(
                fontBold: true,
                fontSize: 14,
            );

            $infoStyle = new \OpenSpout\Common\Entity\Style\Style(
                fontItalic: true,
                fontColor: '#6B7280',
            );

            $summaryStyle = new \OpenSpout\Common\Entity\Style\Style(
                fontBold: true,
            );

            // Helper: create Row from values with optional style for all cells
            $makeRow = function (array $values, ?\OpenSpout\Common\Entity\Style\Style $style = null): Row {
                $cells = [];
                foreach ($values as $i => $val) {
                    $cells[$i] = new \OpenSpout\Common\Entity\Cell\StringCell((string) $val, $style);
                }

                return new Row($cells);
            };

            // Helper: create Row with per-cell style override
            $makeRowWithHighlight = function (array $values, int $highlightIndex, \OpenSpout\Common\Entity\Style\Style $highlightStyle): Row {
                $cells = [];
                foreach ($values as $i => $val) {
                    $style = $i === $highlightIndex ? $highlightStyle : null;
                    $cells[$i] = new \OpenSpout\Common\Entity\Cell\StringCell((string) $val, $style);
                }

                return new Row($cells);
            };

            $writer = new Writer;
            $writer->openToFile($tempPath);

            // Title row
            $writer->addRow($makeRow(['Laporan Absensi'], $titleStyle));

            // Info rows
            $writer->addRow($makeRow(['Periode: ' . $validated['startDate'] . ' s/d ' . $validated['endDate']], $infoStyle));
            $writer->addRow($makeRow(['Dicetak: ' . now()->format('d/m/Y H:i')], $infoStyle));
            $writer->addRow($makeRow([]));

            // Header row
            $writer->addRow($makeRow($data['headers'], $headerStyle));

            // Data rows with conditional styling
            $statusColIndex = array_search('Status', $data['headers']);
            foreach ($data['rows'] as $rowData) {
                if ($statusColIndex !== false && isset($rowData[$statusColIndex])) {
                    $status = strtolower($rowData[$statusColIndex]);
                    $cellStyle = match ($status) {
                        'hadir' => $presentStyle,
                        'terlambat' => $lateStyle,
                        'alpha' => $absentStyle,
                        default => null,
                    };
                    if ($cellStyle) {
                        $writer->addRow($makeRowWithHighlight($rowData, $statusColIndex, $cellStyle));
                    } else {
                        $writer->addRow($makeRow($rowData));
                    }
                } else {
                    $writer->addRow($makeRow($rowData));
                }
            }

            // Summary row
            $writer->addRow($makeRow([]));
            $writer->addRow($makeRow(['Total', '', '', '', '', '', count($data['rows']) . ' data'], $summaryStyle));

            $writer->close();

            $filename = 'absensi-' . now()->format('Y-m-d-His') . '.xlsx';

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
            $classId,
            $subjectId,
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
