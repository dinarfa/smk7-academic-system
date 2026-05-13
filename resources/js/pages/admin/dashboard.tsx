import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import admin from '@/routes/admin';
import { Users, BookOpen, UserCheck, Zap, BarChart3, AlertCircle } from 'lucide-react';

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

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AdminDashboard({ summary, recentActivities }: Props) {
    const statCards = [
        { 
            key: 'total_users', 
            label: 'Total Users', 
            value: summary.total_users,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950',
        },
        { 
            key: 'total_teachers', 
            label: 'Teachers', 
            value: summary.total_teachers,
            icon: BookOpen,
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950',
        },
        { 
            key: 'total_students', 
            label: 'Students', 
            value: summary.total_students,
            icon: UserCheck,
            color: 'from-violet-500 to-violet-600',
            bg: 'bg-violet-50 dark:bg-violet-950',
        },
        { 
            key: 'active_sessions', 
            label: 'Active Sessions', 
            value: summary.active_sessions,
            icon: Zap,
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-950',
        },
        { 
            key: 'today_records', 
            label: 'Today Records', 
            value: summary.today_records,
            icon: BarChart3,
            color: 'from-rose-500 to-rose-600',
            bg: 'bg-rose-50 dark:bg-rose-950',
        },
    ];

    return (
        <AdminLayout title="Admin Dashboard">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
                    <p className="mt-2 text-muted-foreground">System overview and real-time statistics</p>
                </div>

                {/* Statistics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.key} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className={`${stat.bg} pb-3`}>
                                    <div className="flex items-center justify-between">
                                        <CardDescription className="text-xs font-medium">{stat.label}</CardDescription>
                                        <div className={`bg-gradient-to-br ${stat.color} p-2 rounded-lg`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Quick Actions */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <Button asChild className="w-full" variant="default">
                                    <Link href={admin.users.index.url()}>Manage Users</Link>
                                </Button>
                                <Button asChild className="w-full" variant="secondary">
                                    <Link href={admin.classes.index.url()}>Classes</Link>
                                </Button>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={admin.reports.overview.url()}>Reports</Link>
                                </Button>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={admin.reports.bySession.url()}>By Session</Link>
                                </Button>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={admin.auditLogs.index.url()}>Audit Logs</Link>
                                </Button>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={admin.subjects.index.url()}>Subjects</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Health */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                System Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Database</span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="font-medium">Healthy</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">API Server</span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="font-medium">Running</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Cache</span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="font-medium">Active</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                {recentActivities.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Attendance Activities</CardTitle>
                            <CardDescription>Latest scan records across the system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{activity.student_name}</p>
                                            <p className="text-xs text-muted-foreground">{activity.subject} • {activity.session_type || 'Session'}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                            {formatTimeAgo(activity.scanned_at)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
