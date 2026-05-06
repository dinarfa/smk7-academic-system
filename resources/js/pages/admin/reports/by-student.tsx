import { Link } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

const recordStatusClasses = (status: string) => {
    if (status === 'present') {
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
    }

    if (status === 'late') {
        return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200'
    }

    return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200'
}

type StudentRecord = {
    id: number;
    session_subject: string;
    session_type: string;
    status: string;
    scanned_at: string;
}

type Student = {
    id: number;
    name: string;
    email: string;
    records_count: number;
    records: StudentRecord[];
}

type Props = {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    }
}

export default function AdminReportsByStudent({ students }: Props) {
    return (
        <AdminLayout title="Attendance by Student">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Attendance by Student</h1>
                        <p className="mt-2 text-muted-foreground">View each student's attendance history</p>
                    </div>
                    <Button asChild variant="secondary">
                        <Link href={admin.reports.overview.url()}>Back to Overview</Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {students.data.map((student) => (
                        <Card key={student.id}>
                            <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-1">
                                    <CardTitle>{student.name}</CardTitle>
                                    <CardDescription>{student.email}</CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-semibold text-foreground">{student.records_count}</p>
                                    <p className="text-sm text-muted-foreground">total records</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="border-t border-border pt-4">
                                    <h4 className="text-sm font-semibold text-foreground">Attendance History</h4>
                                    <div className="mt-3 overflow-x-auto">
                                        <table className="min-w-full divide-y divide-border">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                        Session
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                        Type
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                        Subject
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                        Date & Time
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {student.records.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-3 text-center text-sm text-muted-foreground">
                                                            No attendance records
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    student.records.map((record) => (
                                                        <tr key={record.id} className="hover:bg-muted/40">
                                                            <td className="px-4 py-2 text-sm font-medium text-foreground">
                                                                {record.session_subject}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                {record.session_type}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                {record.session_subject}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                <Badge className={recordStatusClasses(record.status)}>
                                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                {new Date(record.scanned_at).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="flex items-center justify-between py-4">
                        <div className="flex flex-1 justify-between sm:hidden">
                            {students.prev_page_url && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={students.prev_page_url}>Previous</Link>
                                </Button>
                            )}
                            {students.next_page_url && (
                                <Button asChild variant="outline" size="sm" className="ml-3">
                                    <Link href={students.next_page_url}>Next</Link>
                                </Button>
                            )}
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Page <span className="font-medium text-foreground">{students.current_page}</span> of{' '}
                                <span className="font-medium text-foreground">{students.last_page}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
