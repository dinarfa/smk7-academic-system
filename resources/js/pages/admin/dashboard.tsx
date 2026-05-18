import { Link } from '@inertiajs/react';
import { Users, BookOpen, UserCheck, Zap, BarChart3, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
            bg: 'bg-blue-100 dark:bg-blue-500/15',
        },
        {
            key: 'total_teachers',
            label: 'Guru',
            value: summary.total_teachers,
            icon: BookOpen,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100 dark:bg-emerald-500/15',
        },
        {
            key: 'total_students',
            label: 'Siswa',
            value: summary.total_students,
            icon: UserCheck,
            color: 'text-violet-600',
            bg: 'bg-violet-100 dark:bg-violet-500/15',
        },
        {
            key: 'active_sessions',
            label: 'Sesi Aktif',
            value: summary.active_sessions,
            icon: Zap,
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-500/15',
        },
        {
            key: 'today_records',
            label: 'Catatan Hari Ini',
            value: summary.today_records,
            icon: BarChart3,
            color: 'text-rose-600',
            bg: 'bg-rose-100 dark:bg-rose-500/15',
        },
    ];

    return (
        <AdminLayout title="Dashboard Admin">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Dashboard Admin</h1>
                    <p className="text-muted-foreground">Ringkasan sistem dan statistik real-time</p>
                </div>

                {/* Statistics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <Card key={stat.key}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                                            <Icon className={`h-5 w-5 ${stat.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Quick Actions */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Aksi Cepat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <Button asChild className="w-full" variant="default">
                                    <Link href={admin.users.index.url()}>Kelola Pengguna</Link>
                                </Button>
                                <Button asChild className="w-full" variant="secondary">
                                    <Link href={admin.classes.index.url()}>Kelas</Link>
                                </Button>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={admin.reports.overview.url()}>Laporan</Link>
                                </Button>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={admin.reports.bySession.url()}>Per Sesi</Link>
                                </Button>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={admin.auditLogs.index.url()}>Log Audit</Link>
                                </Button>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={admin.subjects.index.url()}>Mata Pelajaran</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Health */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                Status Sistem
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Database</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span className="font-medium">Sehat</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Server API</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span className="font-medium">Berjalan</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Cache</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span className="font-medium">Aktif</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
