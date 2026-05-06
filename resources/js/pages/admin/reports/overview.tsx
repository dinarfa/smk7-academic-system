import { Link } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

const sessionStatusClasses = (isActive: boolean) =>
    isActive
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
        : 'bg-muted text-muted-foreground'

type Summary = {
    total_users: number;
    total_teachers: number;
    total_students: number;
    total_sessions: number;
    total_records: number;
    today_records: number;
}

type TopStudent = {
    student_id: number;
    student_name: string;
    student_email: string;
    attendance_count: number;
}

type RecentSession = {
    id: number;
    subject: string;
    type: string;
    opened_by: string;
    is_active: boolean;
}

type Props = {
    summary: Summary;
    topStudents: TopStudent[];
    recentSessions: RecentSession[];
}

export default function AdminReportsOverview({ summary, topStudents, recentSessions }: Props) {
    return (
        <AdminLayout title="Reports Overview">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Reports Overview</h1>
                        <p className="mt-2 text-muted-foreground">System statistics and attendance data</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm">
                            <Link href={admin.reports.bySession.url()}>By Session</Link>
                        </Button>
                        <Button asChild size="sm" variant="secondary">
                            <Link href={admin.reports.export.url()}>Export CSV</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    <StatCard label="Total Users" value={summary.total_users} icon="👥" color="blue" />
                    <StatCard label="Teachers" value={summary.total_teachers} icon="🎓" color="green" />
                    <StatCard label="Students" value={summary.total_students} icon="📚" color="purple" />
                    <StatCard label="Sessions" value={summary.total_sessions} icon="📅" color="orange" />
                    <StatCard label="Total Records" value={summary.total_records} icon="📊" color="red" />
                    <StatCard label="Today Records" value={summary.today_records} icon="✅" color="indigo" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Students by Attendance</CardTitle>
                            <CardDescription>Students with the highest attendance count.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topStudents.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">No attendance data</p>
                            ) : (
                                topStudents.map((student, index) => (
                                    <div key={student.student_id} className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
                                        <div>
                                            <p className="font-medium text-foreground">#{index + 1} {student.student_name}</p>
                                            <p className="text-sm text-muted-foreground">{student.student_email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-semibold text-foreground">{student.attendance_count}</p>
                                            <p className="text-xs text-muted-foreground">attendance</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Sessions</CardTitle>
                            <CardDescription>Latest attendance sessions across classes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentSessions.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">No sessions yet</p>
                            ) : (
                                recentSessions.map((session) => (
                                    <div key={session.id} className="border-b border-border py-2 last:border-b-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground">{session.subject}</p>
                                                <p className="text-sm text-muted-foreground">{session.type}</p>
                                                <p className="text-xs text-muted-foreground">by {session.opened_by}</p>
                                            </div>
                                            <Badge className={sessionStatusClasses(session.is_active)}>
                                                {session.is_active ? 'Active' : 'Closed'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Access</CardTitle>
                        <CardDescription>Jump to commonly used admin sections.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Button asChild variant="outline" className="justify-center">
                                <Link href={admin.reports.byStudent.url()}>View by Student</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-center">
                                <Link href={admin.users.index.url()}>Manage Users</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-center">
                                <Link href={admin.auditLogs.index.url()}>Audit Logs</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-center">
                                <Link href={admin.dashboard.url()}>Dashboard</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}

type StatCardProps = {
    label: string;
    value: number;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
        green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200',
        red: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
        indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200',
    }

    return (
        <Card>
            <CardContent className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
                </div>
                <div className={`rounded-full px-3 py-2 text-2xl ${colorClasses[color]}`}>{icon}</div>
            </CardContent>
        </Card>
    )
}
