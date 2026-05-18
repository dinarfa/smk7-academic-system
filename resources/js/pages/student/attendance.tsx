import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock,
    QrCode,
    XCircle,
    ArrowRight,
} from 'lucide-react';
import { useMemo } from 'react';
import AttendanceController from '@/actions/App/Http/Controllers/Student/AttendanceController';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

type AttendanceRecord = {
    id: number;
    status: string;
    scanned_at: string | null;
    session: {
        type: string | null;
        subject: string | null;
        starts_at: string | null;
        ends_at: string | null;
    };
};

type Props = {
    records: {
        data: AttendanceRecord[];
    };
};

const sessionTypeLabels: Record<string, string> = {
    morning: 'Absen Pagi',
    subject: 'Absen Mapel',
    dismissal: 'Absen Pulang',
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
    present: {
        label: 'Hadir',
        color: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-100 dark:bg-emerald-500/15',
        icon: CheckCircle2,
    },
    late: {
        label: 'Terlambat',
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-100 dark:bg-amber-500/15',
        icon: Clock,
    },
    absent: {
        label: 'Tidak Hadir',
        color: 'text-red-700 dark:text-red-300',
        bg: 'bg-red-100 dark:bg-red-500/15',
        icon: XCircle,
    },
};

export default function StudentAttendance({ records }: Props) {
    const stats = useMemo(() => {
        const counts = { total: records.data.length, present: 0, late: 0, absent: 0 };
        records.data.forEach((r) => {
            if (r.status === 'present') {
                counts.present++;
            } else if (r.status === 'late') {
                counts.late++;
            } else if (r.status === 'absent') {
                counts.absent++;
            }
        });

        return counts;
    }, [records.data]);

    return (
        <>
            <Head title="Kehadiran Saya">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Animated gradient background wrapper */}
            <div className="relative min-h-full" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {/* Animated gradient */}
                <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_25%,_#f0f9ff_50%,_#f8fafc_75%,_#eef2ff_100%)] bg-[length:400%_400%] animate-[gradient-shift_15s_ease_infinite] dark:bg-[linear-gradient(135deg,_#020617_0%,_#0f172a_25%,_#0c1222_50%,_#020617_75%,_#0f172a_100%)]" />

                {/* Floating decorative shapes */}
                <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-500/5" />
                <div className="pointer-events-none fixed top-1/4 -right-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-[80px] dark:bg-cyan-400/5" />
                <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-400/8 blur-[90px] dark:bg-indigo-400/4" />

                {/* Grid pattern overlay */}
                <div className="pointer-events-none fixed inset-0 -z-[5] bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)]" />

                <div className="relative z-10 space-y-8 p-4 pb-12 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                Kehadiran Saya
                            </h1>
                            <p className="text-base text-slate-500 dark:text-slate-400">
                                Riwayat kehadiran dan status absensi Anda
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href="/student/attendance/scan">
                                    <QrCode className="mr-2 h-4 w-4" />
                                    Scan QR
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" size="sm" className="rounded-xl">
                                <Link href={dashboard()}>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-blue-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:shadow-blue-500/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Total Absensi
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                                    <ClipboardList className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-500/10" />
                        </div>

                        {/* Hadir */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-emerald-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:shadow-emerald-500/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Hadir
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                                        {stats.present}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-emerald-500/10" />
                        </div>

                        {/* Terlambat */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-amber-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/10 dark:border-white/10 dark:bg-white/5 dark:shadow-amber-500/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Terlambat
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                                        {stats.late}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-amber-500/10" />
                        </div>

                        {/* Tidak Hadir */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-red-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/10 dark:border-white/10 dark:bg-white/5 dark:shadow-red-500/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Tidak Hadir
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400">
                                        {stats.absent}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30">
                                    <XCircle className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-red-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-red-500/10" />
                        </div>
                    </div>

                    {/* Attendance Records */}
                    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                        <div className="px-6 pt-6 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/25">
                                    <CalendarDays className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                        Riwayat Kehadiran
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {records.data.length} catatan kehadiran tercatat
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-3">
                            {records.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
                                        <ClipboardList className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Belum ada kehadiran tercatat
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                        Scan QR dari guru untuk mulai absensi
                                    </p>
                                    <Button asChild className="mt-4 rounded-xl" size="sm">
                                        <Link href="/student/attendance/scan">
                                            <QrCode className="mr-2 h-4 w-4" />
                                            Scan QR Sekarang
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {records.data.map((record) => {
                                        const cfg = statusConfig[record.status] ?? {
                                            label: record.status,
                                            color: 'text-slate-700 dark:text-slate-300',
                                            bg: 'bg-slate-100 dark:bg-slate-500/15',
                                            icon: ClipboardList,
                                        };
                                        const StatusIcon = cfg.icon;
                                        const typeLabel = sessionTypeLabels[record.session.type ?? ''] ?? record.session.type ?? 'Sesi';

                                        return (
                                            <div
                                                key={record.id}
                                                className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3.5 transition-all duration-200 hover:border-slate-200/60 hover:bg-slate-50/80 hover:backdrop-blur-sm dark:hover:border-white/10 dark:hover:bg-white/5"
                                            >
                                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                                                        <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                                {typeLabel}
                                                            </p>
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                                                                {cfg.label}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                                            {record.session.subject ?? 'Tanpa mata pelajaran'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="ml-4 shrink-0 text-right">
                                                    <p className="text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
                                                        {record.scanned_at
                                                            ? new Date(record.scanned_at).toLocaleString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })
                                                            : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    {records.data.length > 0 && (
                        <div className="flex flex-wrap gap-4 rounded-2xl border border-white/60 bg-white/70 px-6 py-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Keterangan:
                            </span>
                            {Object.entries(statusConfig).map(([status, cfg]) => {
                                const Icon = cfg.icon;

                                return (
                                    <div key={status} className="flex items-center gap-1.5">
                                        <div className={`flex h-5 w-5 items-center justify-center rounded-full ${cfg.bg}`}>
                                            <Icon className={`h-3 w-3 ${cfg.color}`} />
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{cfg.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Keyframe for gradient animation */}
            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>
        </>
    );
}

StudentAttendance.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Siswa',
            href: dashboard(),
        },
        {
            title: 'Kehadiran Saya',
            href: AttendanceController.index(),
        },
    ],
};
