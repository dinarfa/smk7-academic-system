import { Link } from '@inertiajs/react';
import { Users, BookOpen, UserCheck, Zap, BarChart3, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';
import admin from '@/routes/admin';

type Summary = {
    total_users: number;
    total_teachers: number;
    total_students: number;
    total_sessions: number;
    today_records: number;
    active_sessions: number;
}

type Activity = {
    id: number;
    student_name: string;
    session_type?: string;
    subject: string;
    scanned_at: string;
}

type Props = {
    summary: Summary;
    recentActivities: Activity[];
}

export default function AdminDashboard({ summary }: Props) {
    const statCards = [
        {
            key: 'total_users',
            label: 'Total Pengguna',
            value: summary.total_users,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            key: 'total_teachers',
            label: 'Guru',
            value: summary.total_teachers,
            icon: BookOpen,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            key: 'total_students',
            label: 'Siswa',
            value: summary.total_students,
            icon: UserCheck,
            color: 'text-violet-600',
            bg: 'bg-violet-100',
            gradient: 'from-violet-500 to-purple-500',
        },
        {
            key: 'active_sessions',
            label: 'Sesi Aktif',
            value: summary.active_sessions,
            icon: Zap,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            gradient: 'from-amber-400 to-orange-500',
        },
        {
            key: 'today_records',
            label: 'Catatan Hari Ini',
            value: summary.today_records,
            icon: BarChart3,
            color: 'text-rose-600',
            bg: 'bg-rose-100',
            gradient: 'from-rose-500 to-pink-500',
        },
    ];

    return (
        <AdminLayout title="Dashboard Admin">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                        Overview
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Dashboard Admin
                    </h1>
                    <p className="mt-1.5 text-slate-500">
                        Ringkasan sistem dan statistik real-time
                    </p>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {statCards.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div key={stat.key} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                            <div className="mt-1 flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Quick Actions */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                                <Zap className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Aksi Cepat</p>
                                <p className="text-xs text-slate-500">Jalan pintas ke menu utama</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-row flex-wrap sm:flex-nowrap gap-3">
                            <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 w-full">
                                <Link href={admin.users.index.url()}>Kelola Pengguna</Link>
                            </Button>
                            <Button asChild className="rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 w-full">
                                <Link href={admin.classes.index.url()}>Kelas</Link>
                            </Button>
                            <Button asChild className="rounded-xl w-full text-slate-700 border-slate-200 hover:bg-slate-50" variant="outline">
                                <Link href={admin.reports.overview.url()}>Laporan</Link>
                            </Button>
                            <Button asChild className="rounded-xl w-full text-slate-700 border-slate-200 hover:bg-slate-50" variant="outline">
                                <Link href={admin.reports.bySession.url()}>Per Sesi</Link>
                            </Button>
                            <Button asChild className="rounded-xl w-full text-slate-700 border-slate-200 hover:bg-slate-50" variant="outline">
                                <Link href={admin.subjects.index.url()}>Mata Pelajaran</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                                <Activity className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Status Sistem</p>
                                <p className="text-xs text-slate-500">Monitoring kondisi server</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Database</span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                Sehat
                            </span>
                        </div>
                        <div className="h-px w-full bg-slate-100" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Server API</span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                Berjalan
                            </span>
                        </div>
                        <div className="h-px w-full bg-slate-100" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Cache</span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                Aktif
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
