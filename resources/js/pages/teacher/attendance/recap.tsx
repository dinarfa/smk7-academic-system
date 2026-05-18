import { Head, Link, router } from '@inertiajs/react';
import {
    Search,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    ShieldQuestion,
    Download,
    Filter,
    CalendarDays,
    BookOpen,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; color: string; bg: string }> = {
    present: { icon: CheckCircle2, label: 'Hadir', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    late: { icon: Clock, label: 'Terlambat', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-500/15' },
    absent: { icon: XCircle, label: 'Tidak Hadir', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-500/15' },
    excused: { icon: ShieldQuestion, label: 'Izin', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-500/15' },
    bolos: { icon: AlertTriangle, label: 'Bolos', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-500/15' },
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

const renderCell = (status?: string) => {
    if (!status) {
        return (
            <div className="flex items-center justify-center">
                <span className="text-xs text-muted-foreground/50">-</span>
            </div>
        );
    }

    const cfg = statusConfig[status] || { icon: null, label: status, color: 'text-muted-foreground', bg: 'bg-muted' };
    const Icon = cfg.icon;

    return (
        <div className="flex items-center justify-center" title={cfg.label}>
            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${cfg.bg}`}>
                {Icon ? <Icon className={`h-4 w-4 ${cfg.color}`} /> : <span className="text-xs">{status[0]}</span>}
            </div>
        </div>
    );
};

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
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Rekap
                    </p>
                    <h1 className="text-3xl font-semibold text-foreground">Rekap Absensi</h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Lihat rekap kehadiran siswa berdasarkan rentang tanggal dan mata pelajaran.
                    </p>
                </div>

                {/* Date + Subject Filter */}
                <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start_date" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Tanggal Mulai
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={filterStart}
                                onChange={(e) => setFilterStart(e.target.value)}
                                className="h-10 w-44 rounded-xl border-slate-200/80 bg-white/80 font-medium backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end_date" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Tanggal Akhir
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={filterEnd}
                                onChange={(e) => setFilterEnd(e.target.value)}
                                className="h-10 w-44 rounded-xl border-slate-200/80 bg-white/80 font-medium backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                            />
                        </div>
                        {subjects.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="subject_filter" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Mata Pelajaran
                                </Label>
                                <select
                                    id="subject_filter"
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                    className="h-10 w-48 rounded-xl border border-slate-200/80 bg-white/80 px-3 font-medium text-sm backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                                >
                                    <option value="">Semua Mapel</option>
                                    {subjects.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <Button
                            onClick={handleFilter}
                            className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/30"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button asChild variant="outline" className="gap-2 rounded-xl">
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
                        { label: 'Hadir', value: stats.present, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
                        { label: 'Terlambat', value: stats.late, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/15' },
                        { label: 'Tidak Hadir', value: stats.absent, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/15' },
                        { label: 'Bolos', value: stats.bolos, icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/15' },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-xl border bg-card p-3">
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
                                <h2 className="text-lg font-bold text-foreground">
                                    {formatDate(date)}
                                </h2>
                                {Array.from(subjectMap.entries()).map(([subject, rows]) => (
                                    <div key={`${date}-${subject}`} className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{subject}</span>
                                        </div>
                                        <div className="overflow-hidden rounded-xl border">
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
                                                                    {renderCell(row[phase])}
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
                    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                        <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            {search ? 'Tidak ada siswa yang cocok' : 'Belum ada catatan absensi pada rentang tanggal ini'}
                        </p>
                    </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/20 px-4 py-3">
                    <span className="text-xs font-medium text-muted-foreground">Keterangan:</span>
                    {Object.entries(statusConfig).map(([status, cfg]) => {
                        const Icon = cfg.icon;

                        return (
                            <div key={status} className="flex items-center gap-1.5">
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full ${cfg.bg}`}>
                                    <Icon className={`h-3 w-3 ${cfg.color}`} />
                                </div>
                                <span className="text-xs text-muted-foreground">{cfg.label}</span>
                            </div>
                        );
                    })}
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
