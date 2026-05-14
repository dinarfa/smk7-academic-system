import { Head, Link } from '@inertiajs/react';
import AttendanceGrid from '@/components/AttendanceGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import {
    CalendarDays,
    QrCode,
    ClipboardList,
    LayoutGrid,
    CheckCircle2,
    Clock,
    Users,
    ArrowRight,
} from 'lucide-react';

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
};

type ActiveSession = {
    id: number;
    qr_token: string;
    type: string;
    ends_at: string;
    subject: string | null;
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
                                            {activeSession.subject ?? 'Tanpa mata pelajaran'} &middot; Berakhir {new Date(activeSession.ends_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
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

                {/* Attendance Grid */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5" />
                            Rekap Absensi Harian
                        </CardTitle>
                        <CardDescription>
                            Status kehadiran siswa di setiap fase: Pagi, Kelas, dan Pulang
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AttendanceGrid attendance={attendance} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TeacherAttendanceDaily.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Grid Absensi', href: '/teacher/attendance/daily' },
    ],
};
