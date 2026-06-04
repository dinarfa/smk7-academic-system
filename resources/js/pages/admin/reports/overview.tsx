import { Head, Link } from '@inertiajs/react';
import {
    FileBarChart2,
    Users,
    Activity,
    UsersRound,
    Calendar,
    FileText,
    FileSpreadsheet,
} from 'lucide-react';
import { useState } from 'react';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import admin from '@/routes/admin';

type Summary = {
    total_users: number;
    total_teachers: number;
    total_students: number;
    total_sessions: number;
    total_records: number;
    today_records: number;
};

type TopStudent = {
    student_id: number;
    student_name: string;
    student_email: string;
    attendance_count: number;
};

type RecentSession = {
    id: number;
    subject: string;
    type: string;
    opened_by: string;
    is_active: boolean;
};

type Semester = {
    label: string;
    value: string;
    startDate: string;
    endDate: string;
};

type Props = {
    summary: Summary;
    topStudents: TopStudent[];
    recentSessions: RecentSession[];
    semesters: Semester[];
};

export default function AdminReportsOverview({
    summary,
    topStudents,
    recentSessions,
    semesters,
}: Props) {
    const [semester, setSemester] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    const getCsrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';

    const handleExport = async (format: 'csv' | 'xlsx') => {
        setProcessing(true);

        try {
            const response = await fetch('/admin/reports/export', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(getCsrfToken()
                        ? { 'X-CSRF-TOKEN': getCsrfToken() }
                        : {}),
                },
                body: JSON.stringify({
                    format,
                    semester,
                }),
            });

            if (!response.ok) {
                alert('Gagal mengekspor data');
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `absensi-admin-${semester.replace('/', '-')}.${format}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch {
            alert('Kesalahan saat mengekspor');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title="Ringkasan Laporan" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Ringkasan Laporan
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Statistik sistem dan data kehadiran
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild size="sm">
                            <Link href={admin.reports.bySession.url()}>
                                Per Sesi
                            </Link>
                        </Button>
                        <Button asChild size="sm" variant="secondary">
                            <Link href={admin.reports.byClass.url()}>
                                Per Kelas
                            </Link>
                        </Button>
                        {semesters.length > 0 && (
                            <Select
                                value={semester}
                                onValueChange={setSemester}
                            >
                                <SelectTrigger className="h-9 w-[240px]">
                                    <SelectValue placeholder="Pilih semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesters.map((s) => (
                                        <SelectItem
                                            key={s.value}
                                            value={s.value}
                                        >
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Button
                            size="sm"
                            onClick={() => handleExport('csv')}
                            disabled={processing || !semester}
                            className="gap-1.5"
                        >
                            <FileText className="h-3.5 w-3.5" />
                            {processing ? 'Mengekspor...' : 'CSV'}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExport('xlsx')}
                            disabled={processing || !semester}
                            className="gap-1.5"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            {processing ? 'Mengekspor...' : 'XLSX'}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        icon={UsersRound}
                        label="Total Pengguna"
                        value={summary.total_users}
                    />
                    <StatCard
                        icon={Users}
                        label="Guru"
                        value={summary.total_teachers}
                    />
                    <StatCard
                        icon={Users}
                        label="Siswa"
                        value={summary.total_students}
                    />
                    <StatCard
                        icon={Calendar}
                        label="Total Sesi"
                        value={summary.total_sessions}
                    />
                    <StatCard
                        icon={FileBarChart2}
                        label="Total Absen"
                        value={summary.total_records}
                    />
                    <StatCard
                        icon={Activity}
                        label="Absen Hari Ini"
                        value={summary.today_records}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Siswa Terajin</CardTitle>
                            <CardDescription>
                                Siswa dengan jumlah kehadiran tertinggi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {topStudents.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Belum ada data kehadiran
                                </p>
                            ) : (
                                <div className="divide-y divide-border">
                                    {topStudents.map((student, index) => (
                                        <div
                                            key={student.student_id}
                                            className="flex items-center justify-between py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {student.student_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {student.student_email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-foreground">
                                                    {student.attendance_count}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Kehadiran
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Sesi Terbaru</CardTitle>
                            <CardDescription>
                                Sesi kehadiran terakhir di seluruh kelas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {recentSessions.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Belum ada sesi
                                </p>
                            ) : (
                                <div className="divide-y divide-border">
                                    {recentSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {session.subject}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {session.type}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        oleh {session.opened_by}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <StatusBadge
                                                    status={
                                                        session.is_active
                                                            ? 'active'
                                                            : 'draft'
                                                    }
                                                    label={
                                                        session.is_active
                                                            ? 'Aktif'
                                                            : 'Ditutup'
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Akses Cepat</CardTitle>
                        <CardDescription>
                            Langkah ke bagian admin yang sering digunakan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Button asChild variant="outline">
                                <Link href={admin.reports.byStudent.url()}>
                                    Per Siswa
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={admin.reports.byClass.url()}>
                                    Per Kelas
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={admin.users.index.url()}>
                                    Kelola Pengguna
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={admin.auditLogs.index.url()}>
                                    Log Audit
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminReportsOverview.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Ringkasan Laporan', href: admin.reports.overview.url() },
    ],
};
