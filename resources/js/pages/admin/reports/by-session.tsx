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

const recordStatusClasses = (status: string) => {
    if (status === 'present') {
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
    }

    if (status === 'late') {
        return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200'
    }

    return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200'
}

type AttendanceRecord = {
    id: number;
    student_name: string;
    student_email: string;
    status: string;
    scanned_at: string;
}

type Session = {
    id: number;
    subject: string;
    type: string;
    opened_by: string;
    created_at: string;
    records_count: number;
    is_active: boolean;
    records: AttendanceRecord[];
}

type Props = {
    sessions: {
        data: Session[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    }
}

export default function AdminReportsBySession({ sessions }: Props) {
    return (
        <AdminLayout title="Kehadiran Per Sesi">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Kehadiran Per Sesi</h1>
                        <p className="text-muted-foreground">Lihat catatan kehadiran berdasarkan kelas/sesi</p>
                    </div>
                    <Button asChild variant="secondary">
                        <Link href={admin.reports.overview.url()}>Kembali</Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {sessions.data.map((session) => (
                        <Card key={session.id}>
                            <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-1">
                                    <CardTitle>{session.subject}</CardTitle>
                                    <CardDescription>
                                        Tipe: {session.type} · Dibuka oleh: {session.opened_by}
                                    </CardDescription>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(session.created_at).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-semibold text-foreground">{session.records_count}</p>
                                    <p className="text-sm text-muted-foreground">peserta</p>
                                    <Badge className={`mt-2 ${sessionStatusClasses(session.is_active)}`}>
                                        {session.is_active ? 'Aktif' : 'Ditutup'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="border-t border-border pt-4">
                                    <h4 className="text-sm font-semibold text-foreground">Catatan Kehadiran</h4>
                                    <div className="mt-3 overflow-x-auto">
                                        <table className="min-w-full divide-y divide-border">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                        Siswa
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                        Email
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                                                        Waktu Scan
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {session.records.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-3 text-center text-sm text-muted-foreground">
                                                            Belum ada catatan kehadiran
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    session.records.map((record) => (
                                                        <tr key={record.id} className="hover:bg-muted/40">
                                                            <td className="px-4 py-2 text-sm font-medium text-foreground">
                                                                {record.student_name}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                {record.student_email}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                <Badge className={recordStatusClasses(record.status)}>
                                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                {new Date(record.scanned_at).toLocaleString('id-ID')}
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
                            {sessions.prev_page_url && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={sessions.prev_page_url}>Sebelumnya</Link>
                                </Button>
                            )}
                            {sessions.next_page_url && (
                                <Button asChild variant="outline" size="sm" className="ml-3">
                                    <Link href={sessions.next_page_url}>Selanjutnya</Link>
                                </Button>
                            )}
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Halaman <span className="font-medium text-foreground">{sessions.current_page}</span> dari{' '}
                                <span className="font-medium text-foreground">{sessions.last_page}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
