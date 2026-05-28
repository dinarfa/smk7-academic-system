import { Head, Link, router } from '@inertiajs/react';
import {
    Search,
    Users,
    Download,
    Filter,
    CalendarDays,
    BookOpen,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dashboard } from '@/routes';

type AttendanceRecord = {
    id: number;
    student_id: number;
    status: string;
    phase: string;
    source: string;
    scanned_at: string;
    student: { id: number; name: string };
};

// Nested: date -> subject -> records[]
type RecapData = Record<string, Record<string, AttendanceRecord[]>>;

type Props = {
    records: RecapData;
    startDate: string;
    endDate: string;
};

const phases = ['morning', 'class', 'dismissal'] as const;
const phaseLabels: Record<string, string> = { morning: 'Pagi', class: 'Kelas', subject: 'Kelas', dismissal: 'Pulang' };

type DayRow = {
    date: string;
    subject: string;
    student_id: number;
    student_name: string;
    morning?: string;
    class?: string;
    dismissal?: string;
    [key: string]: string | number | undefined;
};

function buildRows(records: RecapData): DayRow[] {
    const rows: DayRow[] = [];

    Object.entries(records).forEach(([date, subjectMap]) => {
        Object.entries(subjectMap).forEach(([subject, recs]) => {
            const studentMap = new Map<number, DayRow>();

            recs.forEach((r) => {
                if (!studentMap.has(r.student_id)) {
                    studentMap.set(r.student_id, {
                        date,
                        subject,
                        student_id: r.student_id,
                        student_name: r.student.name,
                    });
                }

                const row = studentMap.get(r.student_id)!;
                const phaseKey = r.phase === 'subject' ? 'class' : r.phase;
                row[phaseKey as keyof DayRow] = r.status;
            });

            rows.push(...Array.from(studentMap.values()));
        });
    });

    return rows.sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);

        if (dateCmp !== 0) {
return dateCmp;
}

        const subjCmp = a.subject.localeCompare(b.subject, 'id-ID');

        if (subjCmp !== 0) {
return subjCmp;
}

        return a.student_name.localeCompare(b.student_name, 'id-ID');
    });
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function AttendanceRecap({ records, startDate, endDate }: Props) {
    const [search, setSearch] = useState('');
    const [filterStart, setFilterStart] = useState(startDate);
    const [filterEnd, setFilterEnd] = useState(endDate);
    const [filterSubject, setFilterSubject] = useState('');

    const allRows = useMemo(() => buildRows(records), [records]);

    // Extract unique subjects for filter dropdown
    const subjects = useMemo(() => {
        const set = new Set<string>();
        allRows.forEach((r) => set.add(r.subject));

        return Array.from(set).sort((a, b) => a.localeCompare(b, 'id-ID'));
    }, [allRows]);

    const filteredRows = useMemo(() => {
        let rows = allRows;

        if (filterSubject) {
            rows = rows.filter((r) => r.subject === filterSubject);
        }

        if (search) {
            rows = rows.filter((r) =>
                r.student_name.toLowerCase().includes(search.toLowerCase()),
            );
        }

        return rows;
    }, [allRows, search, filterSubject]);

    const stats = useMemo(() => {
        const counts = { total: 0, present: 0, late: 0, absent: 0, bolos: 0 };
        filteredRows.forEach((row) => {
            phases.forEach((phase) => {
                const status = row[phase];

                if (status) {
                    counts.total++;

                    if (status === 'present') {
counts.present++;
} else if (status === 'late') {
counts.late++;
} else if (status === 'absent') {
counts.absent++;
} else if (status === 'bolos') {
counts.bolos++;
}
                }
            });
        });

        return counts;
    }, [filteredRows]);

    const handleFilter = () => {
        router.get('/teacher/attendance/recap', {
            start_date: filterStart,
            end_date: filterEnd,
        }, { preserveState: true });
    };

    // Group rows by date -> subject for display
    const dateSubjectGroups = useMemo(() => {
        const groups = new Map<string, Map<string, DayRow[]>>();
        filteredRows.forEach((row) => {
            if (!groups.has(row.date)) {
                groups.set(row.date, new Map());
            }

            const subjectMap = groups.get(row.date)!;

            if (!subjectMap.has(row.subject)) {
                subjectMap.set(row.subject, []);
            }

            subjectMap.get(row.subject)!.push(row);
        });

        return groups;
    }, [filteredRows]);

    return (
        <>
            <Head title="Rekap Absensi" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Rekap Absensi</h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Lihat rekap kehadiran siswa berdasarkan rentang tanggal dan mata pelajaran.
                    </p>
                </div>

                {/* Date + Subject Filter */}
                <div className="rounded-lg border border-border bg-card p-5">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start_date">
                                Tanggal Mulai
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={filterStart}
                                onChange={(e) => setFilterStart(e.target.value)}
                                className="h-10 w-44"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end_date">
                                Tanggal Akhir
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={filterEnd}
                                onChange={(e) => setFilterEnd(e.target.value)}
                                className="h-10 w-44"
                            />
                        </div>
                        {subjects.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="subject_filter">
                                    Mata Pelajaran
                                </Label>
                                <Select value={filterSubject} onValueChange={setFilterSubject}>
                                    <SelectTrigger id="subject_filter" className="w-48">
                                        <SelectValue placeholder="Semua Mapel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <Button
                            onClick={handleFilter}
                            className="gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button asChild variant="outline" className="gap-2">
                            <Link href="/teacher/attendance/export">
                                <Download className="h-4 w-4" />
                                Ekspor
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {[
                        { label: 'Total Catatan', value: stats.total, icon: CalendarDays, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-500/15' },
                        { label: 'Hadir', value: stats.present, icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
                        { label: 'Terlambat', value: stats.late, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/15' },
                        { label: 'Tidak Hadir', value: stats.absent, icon: CalendarDays, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/15' },
                        { label: 'Bolos', value: stats.bolos, icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/15' },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-lg border bg-card p-3">
                            <div className="flex items-center gap-2">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    <p className="text-lg font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari siswa..."
                        className="pl-9"
                    />
                </div>

                {/* Grid by date -> subject */}
                {dateSubjectGroups.size > 0 ? (
                    <div className="space-y-8">
                        {Array.from(dateSubjectGroups.entries()).map(([date, subjectMap]) => (
                            <div key={date} className="space-y-4">
                                <h2 className="text-lg font-medium text-foreground">
                                    {formatDate(date)}
                                </h2>
                                {Array.from(subjectMap.entries()).map(([subject, rows]) => (
                                    <div key={`${date}-${subject}`} className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{subject}</span>
                                        </div>
                                        <div className="overflow-hidden rounded-lg border">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b bg-muted/50">
                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            No
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            Nama Siswa
                                                        </th>
                                                        {phases.map((phase) => (
                                                            <th key={phase} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                {phaseLabels[phase]}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {rows.map((row, idx) => (
                                                        <tr key={`${date}-${subject}-${row.student_id}`} className="transition-colors hover:bg-muted/30">
                                                            <td className="px-4 py-2.5 text-sm text-muted-foreground">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-sm font-medium">
                                                                {row.student_name}
                                                            </td>
                                                            {phases.map((phase) => (
                                                                <td key={phase} className="px-4 py-2.5">
                                                                    <div className="flex items-center justify-center">
                                                                        {row[phase] ? (
                                                                            <StatusBadge status={row[phase]!} />
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground/50">-</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
                        <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            {search ? 'Tidak ada siswa yang cocok' : 'Belum ada catatan absensi pada rentang tanggal ini'}
                        </p>
                    </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/20 px-4 py-3">
                    <span className="text-xs font-medium text-muted-foreground">Keterangan:</span>
                    <StatusBadge status="present" />
                    <StatusBadge status="late" />
                    <StatusBadge status="absent" label="Tidak Hadir" />
                    <StatusBadge status="excused" />
                    <StatusBadge status="bolos" />
                </div>
            </div>
        </>
    );
}

AttendanceRecap.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Rekap Absensi', href: '#' },
    ],
};
