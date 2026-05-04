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

export default function AdminDashboard({ summary }) {
    const metrics = [
        { key: 'total_users', label: 'Total Users', value: summary.total_users },
        { key: 'total_teachers', label: 'Teachers', value: summary.total_teachers },
        { key: 'total_students', label: 'Students', value: summary.total_students },
        { key: 'total_sessions', label: 'Sessions', value: summary.total_sessions },
        { key: 'today_records', label: 'Today Records', value: summary.today_records },
    ];

    return (
        <AdminLayout title="Admin Dashboard">
            <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
                <p className="mt-2 text-muted-foreground">System overview and statistics</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {metrics.map((m) => (
                    <Card key={m.key}>
                        <CardHeader>
                            <CardDescription>{m.label}</CardDescription>
                            <CardTitle>{m.value}</CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Button asChild className="w-full">
                            <Link href={admin.users.index.url()}>Manage Users</Link>
                        </Button>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href={admin.classes.index.url()}>Generate Classes</Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full">
                            <Link href={admin.reports.overview.url()}>View Reports</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href={admin.reports.bySession.url()}>By Session</Link>
                        </Button>
                        <Button asChild variant="destructive" className="w-full">
                            <Link href={admin.auditLogs.index.url()}>Audit Logs</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            </div>
        </AdminLayout>
    );
}
