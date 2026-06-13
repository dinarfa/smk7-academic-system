<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\SemesterHelper;
use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Services\Attendance\AttendanceReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Cell\StringCell;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Color;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Writer;

class AdminReportController extends Controller
{
    /**
     * Display global attendance overview.
     */
    public function overview(AttendanceReportService $attendanceReportService): Response
    {
        $data = $attendanceReportService->overview();

        return Inertia::render('admin/reports/overview', [
            'summary' => $data['summary'],
            'topStudents' => $data['topStudents'],
            'recentSessions' => $data['recentSessions'],
            'semesters' => SemesterHelper::getAvailableSemesters(),
        ]);
    }

    /**
     * Display attendance records by class/session.
     */
    public function bySession(Request $request, AttendanceReportService $attendanceReportService): Response
    {
        $classId = $request->filled('class_id') ? (int) $request->input('class_id') : null;
        $search = $request->filled('search') ? $request->input('search') : null;
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $classes = SchoolClass::query()->select(['id', 'name'])->orderBy('name')->get();
        $sessions = $attendanceReportService->sessions($search, $classId, $startDate, $endDate);

        return Inertia::render('admin/reports/by-session', [
            'sessions' => $sessions,
            'classes' => $classes,
            'filters' => [
                'class_id' => $classId,
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Display attendance records by student.
     */
    public function byStudent(Request $request, AttendanceReportService $attendanceReportService): Response
    {
        $search = $request->filled('search') ? $request->input('search') : null;
        $students = $attendanceReportService->students($search);

        return Inertia::render('admin/reports/by-student', [
            'students' => $students,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display attendance recap by class.
     */
    public function byClass(Request $request, AttendanceReportService $attendanceReportService): Response
    {
        $classId = (int) $request->query('class_id', 0);
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $classes = SchoolClass::query()->select(['id', 'name'])->orderBy('name')->get();

        $data = ['sessions' => collect(), 'summary' => ['total_sessions' => 0, 'total_records' => 0, 'present' => 0, 'absent' => 0, 'excused' => 0]];

        if ($classId > 0) {
            $data = $attendanceReportService->byClass($classId, $startDate, $endDate);
        }

        return Inertia::render('admin/reports/by-class', [
            'classes' => $classes,
            'sessions' => $data['sessions'],
            'summary' => $data['summary'],
            'filters' => [
                'class_id' => $classId ?: null,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Export attendance data with optional filters.
     */
    public function export(Request $request, AttendanceReportService $attendanceReportService)
    {
        $format = $request->input('format', 'csv');
        $semester = $request->input('semester');
        $classId = $request->filled('classId') ? (int) $request->input('classId') : null;
        $subjectId = $request->filled('subjectId') ? (int) $request->input('subjectId') : null;

        $startDate = null;
        $endDate = null;

        if ($semester) {
            $range = SemesterHelper::getDateRange($semester);
            if ($range) {
                $startDate = $range['startDate'];
                $endDate = $range['endDate'];
            }
        } else {
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');
        }

        if ($format === 'xlsx') {
            $data = $attendanceReportService->exportFormattedForAdmin($startDate, $endDate, $classId, $subjectId);

            $tempPath = tempnam(sys_get_temp_dir(), 'admin_attendance_export_');
            abort_if($tempPath === false, 500, 'Unable to create temporary export file.');

            $headerStyle = new Style(
                fontBold: true,
                fontSize: 11,
                fontColor: Color::WHITE,
                backgroundColor: '#3B82F6',
            );

            $presentStyle = new Style(backgroundColor: '#DCFCE7', fontColor: '#166534');
            $absentStyle = new Style(backgroundColor: '#FEE2E2', fontColor: '#991B1B');
            $lateStyle = new Style(backgroundColor: '#FEF9C3', fontColor: '#854D0E');
            $titleStyle = new Style(fontBold: true, fontSize: 14);
            $infoStyle = new Style(fontItalic: true, fontColor: '#6B7280');
            $summaryStyle = new Style(fontBold: true);

            $makeRow = function (array $values, ?Style $style = null): Row {
                $cells = [];
                foreach ($values as $i => $val) {
                    $cells[$i] = new StringCell((string) $val, $style);
                }

                return new Row($cells);
            };

            $writer = new Writer;
            $writer->openToFile($tempPath);

            $writer->addRow($makeRow(['Laporan Absensi - Admin'], $titleStyle));

            $periodText = $semester
                ? 'Semester: '.$semester.' ('.$startDate.' s/d '.$endDate.')'
                : ($startDate && $endDate ? 'Periode: '.$startDate.' s/d '.$endDate : 'Semua Data');
            $writer->addRow($makeRow([$periodText], $infoStyle));
            $writer->addRow($makeRow(['Dicetak: '.now()->format('d/m/Y H:i')], $infoStyle));
            $writer->addRow($makeRow([]));

            $writer->addRow($makeRow($data['headers'], $headerStyle));

            $statusColIndex = array_search('Status', $data['headers'], true);

            foreach ($data['rows'] as $rowData) {
                if ($statusColIndex !== false && isset($rowData[$statusColIndex])) {
                    $status = strtolower((string) $rowData[$statusColIndex]);
                    $cellStyle = match ($status) {
                        'hadir', 'present' => $presentStyle,
                        'alpha', 'absent' => $absentStyle,
                        'terlambat', 'late' => $lateStyle,
                        default => null,
                    };
                    if ($cellStyle) {
                        $highlightCells = [];
                        foreach ($rowData as $i => $val) {
                            $highlightCells[$i] = $i === $statusColIndex
                                ? new StringCell((string) $val, $cellStyle)
                                : new StringCell((string) $val);
                        }
                        $writer->addRow(new Row($highlightCells));
                    } else {
                        $writer->addRow($makeRow($rowData));
                    }
                } else {
                    $writer->addRow($makeRow($rowData));
                }
            }

            $writer->addRow($makeRow([]));
            $writer->addRow($makeRow(['Total', '', '', '', '', '', count($data['rows']).' data'], $summaryStyle));

            $writer->close();

            $filename = 'absensi-admin-'.now()->format('Y-m-d-His').'.xlsx';

            return response()->download(
                $tempPath,
                $filename,
                ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            )->deleteFileAfterSend(true);
        }

        // CSV format
        $csv = $attendanceReportService->exportCsv($startDate, $endDate, $classId, $subjectId);

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="attendance-export-'.now()->format('Y-m-d-His').'.csv"');
    }
}
