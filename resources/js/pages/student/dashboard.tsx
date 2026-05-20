import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    Clock,
    History,
    TrendingUp,
    QrCode,
} from 'lucide-react';

import AttendanceController from '@/actions/App/Http/Controllers/Student/AttendanceController';
import { dashboard } from '@/routes';

type RecentRecord = {
    id: number;
    session_type: string | null;
    subject: string | null;
    scanned_at: string | null;
};

type Props = {
    summary: {
        total_attendance: number;
        today_attendance: number;
    };
    recentRecords: RecentRecord[];
};

const sessionTypeLabels: Record<string, string> = {
    morning: 'Absen Pagi',
    subject: 'Absen Mapel',
    dismissal: 'Absen Pulang',
};

export default function StudentDashboard({
    summary,
    recentRecords,
}: Props) {
    return (
        <>
            <Head title="Dashboard Siswa">
                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                />

                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />

                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="relative min-h-full "
                style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
            >
                {/* Background */}
                <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_25%,_#f0f9ff_50%,_#f8fafc_75%,_#eef2ff_100%)] bg-[length:400%_400%] animate-[gradient-shift_15s_ease_infinite] dark:bg-[linear-gradient(135deg,_#020617_0%,_#0f172a_25%,_#0c1222_50%,_#020617_75%,_#0f172a_100%)]" />

                {/* Glow */}
                <div className="pointer-events-none fixed -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-[120px]" />
                <div className="pointer-events-none fixed top-1/3 -right-32 h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-[100px]" />
                <div className="pointer-events-none fixed bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-[100px]" />

                {/* Grid */}
                <div className="pointer-events-none fixed inset-0 -z-[5] bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)]" />

                <div className="relative z-10 mx-auto max-w-7xl space-y-8 p-4 pb-16 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-700 shadow-sm backdrop-blur-xl dark:border-violet-500/20 dark:bg-white/5 dark:text-violet-300">
                            Dashboard Siswa
                        </div>

                        <div>
                            <h1 className="bg-gradient-to-r from-slate-900 via-violet-700 to-blue-600 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-white dark:via-violet-200 dark:to-blue-200 sm:text-5xl">
                                Selamat Datang 👋
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
                                Pantau riwayat dan statistik kehadiran Anda
                                secara realtime melalui dashboard modern dan
                                interaktif.
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Total */}
                        <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-blue-500/5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-white/10 dark:bg-white/5">
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl transition-all duration-500 group-hover:scale-150" />

                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                                        Total Kehadiran
                                    </p>

                                    <h2 className="mt-3 text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                        {summary.total_attendance}
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Semua data absensi tercatat
                                    </p>
                                </div>

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30">
                                    <TrendingUp className="h-7 w-7" />
                                </div>
                            </div>
                        </div>

                        {/* Today */}
                        <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-emerald-500/5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 dark:border-white/10 dark:bg-white/5">
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl transition-all duration-500 group-hover:scale-150" />

                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                                        Kehadiran Hari Ini
                                    </p>

                                    <h2 className="mt-3 text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                        {summary.today_attendance}
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Kehadiran terbaru hari ini
                                    </p>
                                </div>

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-500 text-white shadow-xl shadow-emerald-500/30">
                                    <CheckCircle2 className="h-7 w-7" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left */}
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                                <div className="border-b border-slate-200/60 px-6 py-5 dark:border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                                            <History className="h-6 w-6" />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                Riwayat Kehadiran
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                Aktivitas absensi terbaru Anda
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {recentRecords.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentRecords.map((record) => (
                                                <div
                                                    key={record.id}
                                                    className="group flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300/40 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                                                >
                                                    <div className="flex min-w-0 items-center gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
                                                            <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                                                                {sessionTypeLabels[
                                                                    record.session_type ??
                                                                    ''
                                                                ] ??
                                                                    record.session_type ??
                                                                    'Sesi'}
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">
                                                                {record.subject ??
                                                                    'Tanpa mata pelajaran'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p className="ml-4 shrink-0 text-xs font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                                                        {record.scanned_at
                                                            ? new Date(
                                                                record.scanned_at,
                                                            ).toLocaleString(
                                                                'id-ID',
                                                            )
                                                            : '-'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-white/10">
                                                <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                                Belum Ada Riwayat
                                            </h3>

                                            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400 dark:text-slate-500">
                                                Riwayat absensi akan muncul di
                                                sini setelah Anda melakukan
                                                kehadiran.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="space-y-6">
                            {/* Quick Menu */}
                            <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                                <div className="p-6">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                        Menu Cepat
                                    </h2>

                                    <div className="mt-5 space-y-3">
                                        <Link
                                            href={AttendanceController.index()}
                                            className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-emerald-50/60 hover:text-emerald-700 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                                                <ClipboardList className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p>Riwayat Kehadiran</p>

                                                <p className="text-xs font-medium text-slate-400">
                                                    Lihat semua absensi
                                                </p>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/student/attendance/scan"
                                            className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-violet-50/60 hover:text-violet-700 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                                                <QrCode className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p>Scan QR</p>

                                                <p className="text-xs font-medium text-slate-400">
                                                    Buka halaman scanner QR
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                                <div className="p-6">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                        Informasi
                                    </h2>

                                    <div className="mt-5 space-y-4">
                                        <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-white/5">
                                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                Dashboard ini menampilkan
                                                statistik dan riwayat
                                                kehadiran siswa secara realtime.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-white/5">
                                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                Gunakan menu riwayat untuk
                                                melihat detail seluruh absensi
                                                yang telah dilakukan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes gradient-shift {
                    0%, 100% {
                        background-position: 0% 50%;
                    }

                    50% {
                        background-position: 100% 50%;
                    }
                }
            `}</style>
        </>
    );
}

StudentDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Siswa',
            href: dashboard(),
        },
    ],
};
