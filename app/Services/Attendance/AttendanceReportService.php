<?php

namespace App\Services\Attendance;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AttendanceReportService
{
    private static function sanitizeCsvCell(?string $value): string
    {
        if ($value === null) {
            return '';
        }

        if (preg_match('/^[=+\-@\t\r]/', $value)) {
            return "'".$value;
        }

        return $value;
    }

    /**
     * Build the data for the admin attendance overview.
     *
     * @return array{
     *     summary: array{
     *         total_users: int,
     *         total_teachers: int,
     *         total_students: int,
     *         total_sessions: int,
     *         total_records: int,
     *         today_records: int,
     *     },
     *     topStudents: Collection<int, array<string, mixed>>,
     *     recentSessions: Collection<int, array<string, mixed>>
     * }
     */
    public function overview(): array
    {
        $userCounts = User::query()->selectRaw("
            COUNT(*) as total_users,
            SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as total_teachers,
            SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students
        ")->first();

        $totalSessions = AttendanceSession::count();

        $totalRecords = AttendanceRecord::count();
        $todayRecords = AttendanceRecord::query()->whereDate('scanned_at', now())->count();

        $topStudents = AttendanceRecord::query()
            ->select('student_id')
            ->selectRaw('COUNT(*) as attendance_count')
            ->with('student:id,name,email')
            ->groupBy('student_id')
            ->orderByRaw('COUNT(*) DESC')
            ->take(10)
            ->get()
            ->map(fn (AttendanceRecord $record): array => [
                'student_id' => $record->student_id,
                'student_name' => $record->student->name,
                'student_email' => $record->student->email,
                'attendance_count' => $record->attendance_count,
            ])->values();

        $recentSessions = AttendanceSession::query()
            ->with(['openedBy:id,name', 'subjectModel:id,name'])
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(fn (AttendanceSession $session): array => [
                'id' => $session->id,
                'type' => $session->type?->value,
                'subject' => $session->subject_name,
                'opened_by' => $session->openedBy->name,
                'created_at' => $session->created_at?->toIso8601String(),
                'is_active' => $session->is_active,
            ])->values();

        return [
            'summary' => [
                'total_users' => $userCounts->total_users,
                'total_teachers' => $userCounts->total_teachers,
                'total_students' => $userCounts->total_students,
                'total_sessions' => $totalSessions,
                'total_records' => $totalRecords,
                'today_records' => $todayRecords,
            ],
            'topStudents' => $topStudents,
            'recentSessions' => $recentSessions,
        ];
    }

    /**
     * Build the paginated admin session report.
     *
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function sessions(?string $search = null, ?int $classId = null, ?string $startDate = null, ?string $endDate = null): LengthAwarePaginator
    {
        $query = AttendanceSession::query()
            ->with(['records' => function ($q): void {
                $q->with('student:id,name,email');
            }, 'openedBy:id,name', 'subjectModel:id,name'])
            ->withCount('records');

        if ($search !== null && $search !== '') {
            $query->where(function ($innerQuery) use ($search): void {
                $innerQuery->where('subject', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhereHas('subjectModel', function ($q) use ($search): void {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($classId !== null) {
            $query->where(function ($q) use ($classId): void {
                $q->where('class_id', $classId)
                    ->orWhereHas('subjectModel.schoolClasses', fn ($sq) => $sq->where('school_classes.id', $classId));
            });
        }

        if ($startDate !== null && $startDate !== '') {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate !== null && $endDate !== '') {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $sessions = $query->latest('created_at')->paginate(10)->withQueryString();

        $sessions->setCollection(
            $sessions->getCollection()->map(fn (AttendanceSession $session): array => [
                'id' => $session->id,
                'type' => $session->type?->value,
                'subject' => $session->subject_name,
                'opened_by' => $session->openedBy->name,
                'starts_at' => $session->starts_at?->toIso8601String(),
                'ends_at' => $session->ends_at?->toIso8601String(),
                'records_count' => $session->records_count,
                'is_active' => $session->is_active,
                'records' => $session->records->map(fn (AttendanceRecord $record): array => [
                    'id' => $record->id,
                    'student_name' => $record->student->name,
                    'student_email' => $record->student->email,
                    'status' => $record->status?->value,
                    'scanned_at' => $record->scanned_at?->toIso8601String(),
                ])->values(),
            ])->values(),
        );

        return $sessions;
    }

    /**
     * Build the paginated admin student report.
     *
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function students(?string $search = null): LengthAwarePaginator
    {
        $query = User::query()
            ->where('role', 'student')
            ->with(['attendanceRecords' => function ($q): void {
                $q->with(['session' => function ($sq): void {
                    $sq->select('id', 'type', 'subject', 'subject_id', 'opened_by')
                        ->with('subjectModel:id,name');
                }])->latest('scanned_at')->limit(50);
            }])
            ->withCount('attendanceRecords');

        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $students = $query->latest()->paginate(10)->withQueryString();

        $students->setCollection(
            $students->getCollection()->map(fn (User $student): array => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'records_count' => $student->attendance_records_count,
                'records' => $student->attendanceRecords->map(fn (AttendanceRecord $record): array => [
                    'id' => $record->id,
                    'session_type' => $record->session->type?->value,
                    'session_subject' => $record->session?->subject_name,
                    'status' => $record->status?->value,
                    'scanned_at' => $record->scanned_at?->toIso8601String(),
                ])->values(),
            ])->values(),
        );

        return $students;
    }

    /**
     * Build the data for admin attendance recap by class.
     *
     * @return array{
     *     sessions: Collection<int, array<string, mixed>>,
     *     summary: array{total_sessions: int, total_records: int, present: int, absent: int, excused: int}
     * }
     */
    public function byClass(int $classId, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = AttendanceSession::query()
            ->with(['openedBy:id,name', 'subjectModel:id,name', 'records' => function ($q): void {
                $q->select(['id', 'attendance_session_id', 'student_id', 'status', 'excused']);
            }])
            ->where(function ($q) use ($classId): void {
                $q->where('class_id', $classId)
                    ->orWhereHas('subjectModel.schoolClasses', fn ($sq) => $sq->where('school_classes.id', $classId));
            })
            ->latest('created_at');

        if ($startDate !== null && $startDate !== '') {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate !== null && $endDate !== '') {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $sessions = $query->get()->map(fn (AttendanceSession $session): array => [
            'id' => $session->id,
            'type' => $session->type?->value,
            'subject' => $session->subject_name,
            'opened_by' => $session->openedBy->name,
            'created_at' => $session->created_at?->toIso8601String(),
            'is_active' => $session->is_active,
            'total' => $session->records->count(),
            'present' => $session->records->where('status', 'present')->count(),
            'absent' => $session->records->where('status', 'absent')->count(),
            'excused' => $session->records->where('excused', true)->count(),
        ])->values();

        $totalRecords = $sessions->sum('total');

        return [
            'sessions' => $sessions,
            'summary' => [
                'total_sessions' => $sessions->count(),
                'total_records' => $totalRecords,
                'present' => $sessions->sum('present'),
                'absent' => $sessions->sum('absent'),
                'excused' => $sessions->sum('excused'),
            ],
        ];
    }

    /**
     * Build the CSV contents for attendance export using chunked processing.
     */
    public function exportCsv(?string $startDate = null, ?string $endDate = null, ?int $classId = null, ?int $subjectId = null): string
    {
        $stream = fopen('php://temp', 'r+');

        fputcsv($stream, ['Student Name', 'Email', 'Session Type', 'Subject', 'Phase', 'Source', 'Status', 'Excused', 'Scanned At']);

        AttendanceRecord::query()
            ->with(['student:id,name,email', 'session', 'session.subjectModel:id,name'])
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate): void {
                $query->whereBetween('scanned_at', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ]);
            })
            ->when($classId !== null || $subjectId !== null, function ($query) use ($classId, $subjectId): void {
                $query->whereHas('session', function ($q) use ($classId, $subjectId): void {
                    if ($classId !== null) {
                        $q->where(function ($sq) use ($classId): void {
                            $sq->where('class_id', $classId)
                                ->orWhereHas('subjectModel.schoolClasses', fn ($s) => $s->where('school_classes.id', $classId));
                        });
                    }
                    if ($subjectId !== null) {
                        $q->where('subject_id', $subjectId);
                    }
                });
            })
            ->orderBy('id')
            ->chunk(500, function ($records) use ($stream): void {
                foreach ($records as $record) {
                    fputcsv($stream, [
                        self::sanitizeCsvCell($record->student?->name),
                        self::sanitizeCsvCell($record->student?->email),
                        $record->session?->type?->value,
                        $record->session?->subject_name,
                        $record->phase?->value ?? $record->phase,
                        $record->source,
                        $record->status?->value,
                        $record->excused ? 'yes' : 'no',
                        $record->scanned_at?->toIso8601String(),
                    ]);
                }
            });

        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);

        return $csv;
    }

    /**
     * Build formatted attendance data for admin XLSX export.
     *
     * @return array{headers: array<int, string>, rows: array<int, array<int, mixed>>}
     */
    public function exportFormattedForAdmin(?string $startDate = null, ?string $endDate = null, ?int $classId = null, ?int $subjectId = null): array
    {
        $headers = ['No', 'Nama Siswa', 'Email', 'Kelas', 'Mapel', 'Tipe Sesi', 'Status', 'Waktu Absen'];
        $rows = [];
        $no = 0;

        AttendanceRecord::query()
            ->with(['student:id,name,email', 'session', 'session.subjectModel:id,name'])
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate): void {
                $query->whereBetween('scanned_at', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ]);
            })
            ->when($classId !== null || $subjectId !== null, function ($query) use ($classId, $subjectId): void {
                $query->whereHas('session', function ($q) use ($classId, $subjectId): void {
                    if ($classId !== null) {
                        $q->where(function ($sq) use ($classId): void {
                            $sq->where('class_id', $classId)
                                ->orWhereHas('subjectModel.schoolClasses', fn ($s) => $s->where('school_classes.id', $classId));
                        });
                    }
                    if ($subjectId !== null) {
                        $q->where('subject_id', $subjectId);
                    }
                });
            })
            ->orderBy('id')
            ->chunk(500, function ($records) use (&$rows, &$no): void {
                foreach ($records as $record) {
                    $no++;
                    $rows[] = [
                        $no,
                        $record->student?->name,
                        $record->student?->email,
                        $record->session?->class_name,
                        $record->session?->subject_name,
                        $record->session?->type?->label() ?? $record->session?->type?->value,
                        match ($record->status?->value) {
                            'present' => 'Hadir',
                            'absent' => 'Alpha',
                            'late' => 'Terlambat',
                            default => $record->status?->value,
                        },
                        $record->scanned_at?->format('d/m/Y H:i'),
                    ];
                }
            });

        return ['headers' => $headers, 'rows' => $rows];
    }

    /**
     * Build the CSV contents for a teacher attendance export within a date range using chunked processing.
     */
    public function exportCsvForTeacher(int $teacherId, string $startDate, string $endDate, ?int $classId = null, ?int $subjectId = null, ?string $sessionType = null): string
    {
        $stream = fopen('php://temp', 'r+');

        fputcsv($stream, [
            'Student Name',
            'Email',
            'Session Type',
            'Subject',
            'Phase',
            'Source',
            'Status',
            'Excused',
            'Scanned At',
        ]);

        AttendanceRecord::query()
            ->with(['student:id,name,email', 'session', 'session.subjectModel:id,name'])
            ->whereHas('session', function ($query) use ($teacherId, $classId, $subjectId, $sessionType): void {
                $query->where('opened_by', $teacherId);
                if ($classId !== null) {
                    $query->where(function ($q) use ($classId): void {
                        $q->where('class_id', $classId)
                            ->orWhereHas('subjectModel.schoolClasses', fn ($sq) => $sq->where('school_classes.id', $classId));
                    });
                }
                if ($subjectId !== null) {
                    $query->where('subject_id', $subjectId);
                }
                if ($sessionType !== null) {
                    $query->where('type', $sessionType);
                }
            })
            ->whereBetween('scanned_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ])
            ->orderBy('id')
            ->chunk(500, function ($records) use ($stream): void {
                foreach ($records as $record) {
                    fputcsv($stream, [
                        self::sanitizeCsvCell($record->student?->name),
                        self::sanitizeCsvCell($record->student?->email),
                        $record->session?->type?->value,
                        $record->session?->subject_name,
                        $record->phase?->value ?? $record->phase,
                        $record->source,
                        $record->status?->value,
                        $record->excused ? 'yes' : 'no',
                        $record->scanned_at?->toIso8601String(),
                    ]);
                }
            });

        rewind($stream);

        $csv = stream_get_contents($stream) ?: '';

        fclose($stream);

        return $csv;
    }

    /**
     * Build an array of rows for attendance export for a teacher using chunked processing.
     * First row is the header, following rows are data arrays.
     *
     * @return array<int, array<int, mixed>>
     */
    public function exportArrayForTeacher(int $teacherId, string $startDate, string $endDate, ?int $classId = null, ?int $subjectId = null, ?string $sessionType = null): array
    {
        $rows = [];

        $rows[] = [
            'Student Name',
            'Email',
            'Session Type',
            'Subject',
            'Phase',
            'Source',
            'Status',
            'Excused',
            'Scanned At',
        ];

        AttendanceRecord::query()
            ->with(['student:id,name,email', 'session', 'session.subjectModel:id,name'])
            ->whereHas('session', function ($query) use ($teacherId, $classId, $subjectId, $sessionType): void {
                $query->where('opened_by', $teacherId);
                if ($classId !== null) {
                    $query->where(function ($q) use ($classId): void {
                        $q->where('class_id', $classId)
                            ->orWhereHas('subjectModel.schoolClasses', fn ($sq) => $sq->where('school_classes.id', $classId));
                    });
                }
                if ($subjectId !== null) {
                    $query->where('subject_id', $subjectId);
                }
                if ($sessionType !== null) {
                    $query->where('type', $sessionType);
                }
            })
            ->whereBetween('scanned_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ])
            ->orderBy('id')
            ->chunk(500, function ($records) use (&$rows): void {
                foreach ($records as $record) {
                    $rows[] = [
                        self::sanitizeCsvCell($record->student?->name),
                        self::sanitizeCsvCell($record->student?->email),
                        $record->session?->type?->value,
                        $record->session?->subject_name,
                        $record->phase?->value ?? $record->phase,
                        $record->source,
                        $record->status?->value,
                        $record->excused ? 'yes' : 'no',
                        $record->scanned_at?->toIso8601String(),
                    ];
                }
            });

        return $rows;
    }

    /**
     * Build formatted export data for a teacher with headers and rows separated.
     *
     * @return array{headers: array<int, string>, rows: array<int, array<int, string>>}
     */
    public function exportFormattedForTeacher(int $teacherId, string $startDate, string $endDate, ?int $classId = null, ?int $subjectId = null, ?string $sessionType = null): array
    {
        $headers = ['No', 'Nama Siswa', 'Email', 'Kelas', 'Mapel', 'Tipe Sesi', 'Status', 'Waktu Absen'];

        $rows = [];

        AttendanceRecord::query()
            ->with(['student:id,name,email,school_class_id', 'student.schoolClass:id,name', 'session', 'session.subjectModel:id,name'])
            ->whereHas('session', function ($query) use ($teacherId, $classId, $subjectId, $sessionType): void {
                $query->where('opened_by', $teacherId);
                if ($classId !== null) {
                    $query->where(function ($q) use ($classId): void {
                        $q->where('class_id', $classId)
                            ->orWhereHas('subjectModel.schoolClasses', fn ($sq) => $sq->where('school_classes.id', $classId));
                    });
                }
                if ($subjectId !== null) {
                    $query->where('subject_id', $subjectId);
                }
                if ($sessionType !== null) {
                    $query->where('type', $sessionType);
                }
            })
            ->whereBetween('scanned_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ])
            ->orderBy('scanned_at')
            ->chunk(500, function ($records) use (&$rows): void {
                $no = count($rows) + 1;
                foreach ($records as $record) {
                    $rows[] = [
                        $no++,
                        $record->student?->name ?? '-',
                        $record->student?->email ?? '-',
                        $record->student?->schoolClass?->name ?? '-',
                        $record->session?->subject_name ?? '-',
                        match ($record->session?->type?->value) {
                            'morning' => 'Pagi',
                            'subject' => 'Mata Pelajaran',
                            'dismissal' => 'Pulang',
                            default => $record->session?->type?->value ?? '-',
                        },
                        match ($record->status?->value) {
                            'present' => 'Hadir',
                            'late' => 'Terlambat',
                            'absent' => 'Alpha',
                            default => $record->status?->value ?? '-',
                        },
                        $record->scanned_at ? Carbon::parse($record->scanned_at)->format('d/m/Y H:i') : '-',
                    ];
                }
            });

        return [
            'headers' => $headers,
            'rows' => $rows,
        ];
    }
}
