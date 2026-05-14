import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldQuestion } from 'lucide-react';

type AttendanceRecord = {
    id: number;
    student_id: number;
    status: string;
    phase: string;
    source: string;
    scanned_at: string;
    student: {
        id: number;
        name: string;
    };
};

type GridData = {
    student_id: number;
    student_name: string;
    morning?: string;
    class?: string;
    dismissal?: string;
    [key: string]: string | number | undefined;
};

interface AttendanceGridProps {
    attendance: Record<string, AttendanceRecord[]>;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; color: string; bg: string }> = {
    present: { icon: CheckCircle2, label: 'Hadir', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    late: { icon: Clock, label: 'Terlambat', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-500/15' },
    absent: { icon: XCircle, label: 'Tidak Hadir', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-500/15' },
    excused: { icon: ShieldQuestion, label: 'Izin', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-500/15' },
    bolos: { icon: AlertTriangle, label: 'Bolos', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-500/15' },
};

const phases = ['morning', 'class', 'dismissal'] as const;
const phaseLabels: Record<string, string> = { morning: 'Pagi', class: 'Kelas', dismissal: 'Pulang' };

export default function AttendanceGrid({ attendance }: AttendanceGridProps) {
    const [search, setSearch] = useState('');

    const studentMap = new Map<number, GridData>();

    Object.entries(attendance).forEach(([phase, records]) => {
        records.forEach((record) => {
            const key = record.student_id;
            if (!studentMap.has(key)) {
                studentMap.set(key, {
                    student_id: key,
                    student_name: record.student.name,
                });
            }
            const gridRow = studentMap.get(key)!;
            const phaseKey = phase === 'subject' ? 'class' : phase;
            gridRow[phaseKey] = record.status;
        });
    });

    const sortedStudents = Array.from(studentMap.values()).sort((a, b) =>
        a.student_name.localeCompare(b.student_name, 'id-ID'),
    );

    const filteredStudents = useMemo(() => {
        if (!search) return sortedStudents;
        return sortedStudents.filter((s) =>
            s.student_name.toLowerCase().includes(search.toLowerCase()),
        );
    }, [sortedStudents, search]);

    const stats = useMemo(() => {
        const counts = { total: 0, present: 0, late: 0, absent: 0, bolos: 0 };
        sortedStudents.forEach((row) => {
            phases.forEach((phase) => {
                const status = row[phase];
                if (status) {
                    counts.total++;
                    if (status === 'present') counts.present++;
                    else if (status === 'late') counts.late++;
                    else if (status === 'absent') counts.absent++;
                    else if (status === 'bolos') counts.bolos++;
                }
            });
        });
        return counts;
    }, [sortedStudents]);

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

    return (
        <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                    { label: 'Total Siswa', value: sortedStudents.length, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-500/15' },
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

            {/* Grid */}
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
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((row, idx) => (
                                <tr
                                    key={row.student_id}
                                    className="transition-colors hover:bg-muted/30"
                                >
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center">
                                    <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">
                                        {search ? 'Tidak ada siswa yang cocok' : 'Belum ada catatan absensi'}
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
    );
}
