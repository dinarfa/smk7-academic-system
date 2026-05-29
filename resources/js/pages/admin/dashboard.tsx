import { Head, Link } from '@inertiajs/react';
import {
    Users,
    BookOpen,
    UserCheck,
    Zap,
    Clock,
    ScrollText,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import admin from '@/routes/admin';

type Summary = {
    total_users: number;
    total_teachers: number;
    total_students: number;
    total_sessions: number;
    today_records: number;
    active_sessions: number;
};

type Activity = {
    id: number;
    student_name: string;
    session_type?: string;
    subject: string;
    scanned_at: string;
};

type WeeklyData = {
    day: string;
    date: string;
    hadir: number;
    terlambat: number;
};

type Props = {
    summary: Summary;
    recentActivities: Activity[];
    weeklyAttendance: WeeklyData[];
};

export default function AdminDashboard({
    summary,
    recentActivities,
    weeklyAttendance,
}: Props) {
    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ringkasan sistem
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Users}
                        label="Total Pengguna"
                        value={summary.total_users}
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Guru"
                        value={summary.total_teachers}
                    />
                    <StatCard
                        icon={UserCheck}
                        label="Siswa"
                        value={summary.total_students}
                    />
                    <StatCard
                        icon={Zap}
                        label="Sesi Aktif"
                        value={summary.active_sessions}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Absensi Mingguan</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Jumlah kehadiran 7 hari terakhir
                        </p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={weeklyAttendance}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                />
                                <XAxis
                                    dataKey="day"
                                    className="text-xs"
                                    tick={{
                                        fill: 'hsl(var(--muted-foreground))',
                                    }}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{
                                        fill: 'hsl(var(--muted-foreground))',
                                    }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                />
                                <Bar
                                    dataKey="hadir"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    name="Hadir"
                                />
                                <Bar
                                    dataKey="terlambat"
                                    fill="hsl(var(--chart-4))"
                                    radius={[4, 4, 0, 0]}
                                    name="Terlambat"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Aktivitas Terbaru</CardTitle>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={admin.auditLogs.index.url()}>
                                    <ScrollText className="mr-2 h-4 w-4" />
                                    Audit Log
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentActivities && recentActivities.length > 0 ? (
                            <div>
                                {recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between border-b border-border py-3 last:border-0"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {activity.student_name}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {activity.subject}
                                                    {activity.session_type
                                                        ? ` · ${activity.session_type}`
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="ml-4 shrink-0 text-xs text-muted-foreground tabular-nums">
                                            {new Date(
                                                activity.scanned_at,
                                            ).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Belum ada aktivitas terbaru
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Admin',
            href: admin.dashboard.url(),
        },
    ],
};
