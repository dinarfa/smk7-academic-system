import { Head, Form, Link, router } from '@inertiajs/react';
import { QrCode, Clock, Users, Zap, Download, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import AttendanceSessionController from '@/actions/App/Http/Controllers/Teacher/AttendanceSessionController';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

type ActiveSession = {
    id: number;
    type: 'morning' | 'subject' | 'dismissal';
    subject: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    records_count: number;
    qr_payload: string;
    qr_svg: string;
};

type RecentRecord = {
    id: number;
    student_name: string | null;
    session_type: string | null;
    subject: string | null;
    scanned_at: string | null;
};

type Subject = {
    id: number;
    name: string;
    code: string;
};

type Props = {
    subjects: Subject[];
    summary: {
        students_count: number;
        active_sessions_count: number;
        today_records_count: number;
    };
    activeSessions: ActiveSession[];
    recentRecords: RecentRecord[];
};

function typeLabel(type: ActiveSession['type']): string {
    if (type === 'morning') {
        return 'Absen Pagi';
    }

    if (type === 'subject') {
        return 'Absen Mata Pelajaran';
    }

    return 'Absen Pulang';
}

export default function TeacherDashboard({
    summary,
    activeSessions,
}: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    // Reload when any active session expires
    useEffect(() => {
        const hasExpired = activeSessions.some((session) => {
            if (!session.ends_at) {
                return false;
            }

            return new Date(session.ends_at).getTime() - currentTime.getTime() <= 0;
        });

        if (hasExpired) {
            router.reload({ only: ['summary', 'activeSessions', 'recentRecords'] });
        }
    }, [currentTime, activeSessions]);

    const getTimeRemaining = (endTime: string | null) => {
        if (!endTime) {
            return '—';
        }

        const diff = new Date(endTime).getTime() - currentTime.getTime();

        if (diff <= 0) {
            return 'Expired';
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Filter out expired sessions client-side for immediate UI update
    const visibleSessions = activeSessions.filter(
        (s) => !s.ends_at || new Date(s.ends_at).getTime() - currentTime.getTime() > 0,
    );

    return (
        <>
            <Head title="Dashboard Guru">
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
                <div className="pointer-events-none fixed -bottom-20 right-1/4 h-64 w-64 rounded-full bg-sky-300/10 blur-[70px] dark:bg-sky-300/5" />

                {/* Grid pattern overlay */}
                <div className="pointer-events-none fixed inset-0 -z-[5] bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)]" />

                <div className="relative z-10 space-y-8 p-4 pb-12 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                            Dashboard Guru
                        </h1>
                        <p className="text-base text-slate-500 dark:text-slate-400">
                            Kelola absensi dan aktivitas siswa
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Total Siswa */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-blue-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:shadow-blue-500/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Total Siswa
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {summary.students_count}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-500/10" />
                        </div>

                        {/* Sesi Aktif */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-amber-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/10 dark:border-white/10 dark:bg-white/5 dark:shadow-amber-500/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Sesi Aktif
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {summary.active_sessions_count}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30">
                                    <Zap className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-amber-500/10" />
                        </div>

                        {/* Absensi Hari Ini */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-emerald-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:shadow-emerald-500/5 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Absensi Hari Ini
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {summary.today_records_count}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-emerald-500/10" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid gap-6 lg:grid-cols-1">
                        <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                            <div className="px-6 pt-6 pb-2">
                                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                    Akses Cepat
                                </h2>
                            </div>
                            <div className="space-y-2 px-6 pb-6 pt-2">
                                <Link
                                    href="/teacher/attendance/qr"
                                    className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-blue-300/50 hover:bg-blue-50/50 hover:text-blue-700 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:group-hover:bg-blue-500/25">
                                        <QrCode className="h-4 w-4" />
                                    </div>
                                    Tampilkan QR
                                </Link>
                                <Link
                                    href="/teacher/attendance/daily"
                                    className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-amber-300/50 hover:bg-amber-50/50 hover:text-amber-700 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-amber-500/30 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:group-hover:bg-amber-500/25">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    Grid Absensi
                                </Link>
                                <Link
                                    href="/teacher/attendance/recap"
                                    className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-indigo-300/50 hover:bg-indigo-50/50 hover:text-indigo-700 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:group-hover:bg-indigo-500/25">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    Rekap Absensi
                                </Link>
                                <Link
                                    href="/teacher/attendance/export"
                                    className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-violet-300/50 hover:bg-violet-50/50 hover:text-violet-700 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:group-hover:bg-violet-500/25">
                                        <Download className="h-4 w-4" />
                                    </div>
                                    Ekspor Absensi
                                </Link>
                                <Link
                                    href="/teacher/students"
                                    className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-emerald-300/50 hover:bg-emerald-50/50 hover:text-emerald-700 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:group-hover:bg-emerald-500/25">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    Kelola Siswa
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    {visibleSessions.length > 0 && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    Sesi Aktif
                                </h2>
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                                    {visibleSessions.length}
                                </span>
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                {visibleSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="group overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
                                    >
                                        <div className="flex items-start justify-between px-6 pt-6 pb-3">
                                            <div className="space-y-1">
                                                <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                                    {typeLabel(session.type)}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {session.subject ?? 'Tanpa mata pelajaran'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 backdrop-blur-sm dark:bg-emerald-500/15">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                                    </span>
                                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Aktif</span>
                                                </span>
                                                <div className="mt-2 text-lg font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
                                                    {getTimeRemaining(session.ends_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-6 pb-6">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-2.5 backdrop-blur-sm dark:bg-white/5">
                                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Tercatat</span>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {session.records_count} siswa
                                                    </span>
                                                </div>
                                            </div>

                                            {session.is_active && (
                                                <Form
                                                    {...AttendanceSessionController.close.form(session.id)}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="destructive"
                                                            className="h-10 w-full rounded-xl font-semibold shadow-lg shadow-red-500/15 transition-all duration-200 hover:shadow-xl hover:shadow-red-500/25"
                                                            disabled={processing}
                                                        >
                                                            {processing ? 'Menutup...' : 'Tutup Sesi'}
                                                        </Button>
                                                    )}
                                                </Form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Records */}
                </div >
            </div >

            {/* Keyframe for gradient animation */}
            < style > {`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style >
        </>
    );
}

TeacherDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
    ],
};
