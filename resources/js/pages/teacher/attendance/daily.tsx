import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    QrCode,
    ClipboardList,
    LayoutGrid,
    CheckCircle2,
    Clock,
    Users,
    ArrowRight,
    BookOpen,
    Download,
} from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

type AttendanceRecord = {
    id: number;
    student_id: number;
    status: string;
    phase: string;
    source: string;
    scanned_at: string;
    student: {
        id: number;
        name: string;
    };
    session?: {
        id: number;
        type: string;
        subject: string | null;
        subject_id: number | null;
        subject_name: string | null;
    };
};

type ActiveSession = {
    id: number;
    qr_token: string;
    type: string;
    ends_at: string;
    subject: string | null;
    subject_id: number | null;
    subject_name: string | null;
};

type Props = {
    attendance: Record<string, AttendanceRecord[]>;
    active_session: ActiveSession | null;
    date: string;
};

export default function TeacherAttendanceDaily({ attendance, active_session: activeSession, date }: Props) {
    const allRecords = Object.values(attendance).flat();
    const totalRecords = allRecords.length;
    const presentCount = allRecords.filter((r) => r.status === 'present').length;
    const lateCount = allRecords.filter((r) => r.status === 'late').length;
    const absentCount = allRecords.filter((r) => r.status === 'absent').length;

    const sessionTypeLabels: Record<string, string> = {
        morning: 'Absen Pagi',
        class: 'Absen Kelas',
        subject: 'Absen Mapel',
        dismissal: 'Absen Pulang',
    };

    // Group records within each phase by subject
    const groupedAttendance = useMemo(() => {
        const result: Record<string, Record<string, AttendanceRecord[]>> = {};
        Object.entries(attendance).forEach(([phase, records]) => {
            const bySubject: Record<string, AttendanceRecord[]> = {};
            records.forEach((r) => {
                const subject = r.session?.subject_name ?? 'Umum';

                if (!bySubject[subject]) {
bySubject[subject] = [];
}

                bySubject[subject].push(r);
            });
            result[phase] = bySubject;
        });

        return result;
    }, [attendance]);

    return (
        <>
            <Head title="Grid Absensi" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Grid Absensi</h1>
                        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            {date}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link href="/teacher/attendance/qr">
                                <QrCode className="h-4 w-4" />
                                QR Aktif
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link href="/teacher/attendance/manual">
                                <ClipboardList className="h-4 w-4" />
                                Absensi Manual
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" size="sm" className="gap-2">
                            <Link href="/teacher/attendance">
                                <LayoutGrid className="h-4 w-4" />
                                Workflow
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-500/15">
                                    <Users className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Catatan</p>
                                    <p className="text-2xl font-bold">{totalRecords}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Hadir</p>
                                    <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/15">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Terlambat</p>
                                    <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/15">
                                    <CheckCircle2 className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tidak Hadir</p>
                                    <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active session banner */}
                {activeSession && (
                    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                        <CardContent className="py-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-3 w-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                            Sesi Aktif: {sessionTypeLabels[activeSession.type] ?? activeSession.type}
                                        </p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                            {activeSession.subject_name ?? 'Tanpa mata pelajaran'} &middot; Berakhir {new Date(activeSession.ends_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <Button asChild size="sm" variant="outline" className="gap-1.5">
                                    <Link href="/teacher/attendance/qr">
                                        Lihat QR <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Attendance by Phase, grouped by Subject */}
                <div className="space-y-6">
                    {['morning', 'class', 'dismissal'].map((phase) => {
                        const subjectMap = groupedAttendance[phase];
                        const phaseRecords = attendance[phase] ?? [];
                        const hasMultipleSubjects = subjectMap && Object.keys(subjectMap).length > 1;

                        return (
                            <Card key={phase}>
                                <CardHeader>
                                    <CardTitle className="capitalize">{sessionTypeLabels[phase] ?? phase} - Absensi</CardTitle>
                                    <CardDescription>
                                        {phaseRecords.length} siswa tercatat
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {phaseRecords.length > 0 ? (
                                        hasMultipleSubjects ? (
                                            <div className="space-y-4">
                                                {Object.entries(subjectMap).map(([subject, recs]) => (
                                                    <div key={subject}>
                                                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                                            <BookOpen className="h-4 w-4" />
                                                            <span>{subject}</span>
                                                            <Badge variant="secondary" className="ml-1 text-xs">{recs.length}</Badge>
                                                        </div>
                                                        <Table records={recs} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <Table records={phaseRecords} />
                                        )
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground">
                                                Belum ada catatan absensi untuk fase ini
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Absensi Manual</CardTitle>
                            <CardDescription>
                                Gunakan ketika pemindaian QR tidak tersedia atau untuk pembaruan massal.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/teacher/attendance/manual">
                                    Buka Absensi Manual
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Ekspor Data
                            </CardTitle>
                            <CardDescription>
                                Unduh data absensi dalam format CSV atau XLSX.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/teacher/attendance/export">
                                    Buka Halaman Ekspor
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rekap Absensi</CardTitle>
                            <CardDescription>
                                Lihat rekap kehadiran siswa berdasarkan rentang tanggal.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/teacher/attendance/recap">
                                    Lihat Rekap
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

// Inline table component for attendance records
function Table({ records }: { records: AttendanceRecord[] }) {
    const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
        switch (status) {
            case 'present': return 'default';
            case 'late': return 'secondary';
            case 'absent': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Siswa</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Waktu</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sumber</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {records.map((record) => (
                        <tr key={record.id} className="transition-colors hover:bg-muted/30">
                            <td className="px-4 py-2.5 font-medium">{record.student.name}</td>
                            <td className="px-4 py-2.5">
                                <Badge variant={getStatusVariant(record.status)} className="capitalize">
                                    {record.status}
                                </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-sm text-muted-foreground">
                                {new Date(record.scanned_at).toLocaleTimeString('id-ID')}
                            </td>
                            <td className="px-4 py-2.5 text-sm text-muted-foreground">{record.source}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

TeacherAttendanceDaily.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Grid Absensi', href: '/teacher/attendance/daily' },
    ],
};
