import { Head, Link } from '@inertiajs/react';
import AttendanceGrid from '@/components/AttendanceGrid';
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
    const totalRecords = Object.values(attendance).flat().length;
    const presentCount = Object.values(attendance)
        .flat()
        .filter((record) => record.status === 'present').length;

    return (
        <>
            <Head title="Absensi Harian Guru" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Daily Attendance
                        </p>
                        <h1 className="text-3xl font-semibold text-foreground">Absensi Harian</h1>
                        <p className="text-muted-foreground">Kelola absensi siswa untuk {date}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href="/teacher/attendance/qr">Lihat QR Aktif</Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="/teacher/attendance">Workflow Absensi</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total Rekor</CardDescription>
                            <CardTitle>{totalRecords}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Hadir</CardDescription>
                            <CardTitle>{presentCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Sesi Aktif</CardDescription>
                            <CardTitle>{activeSession ? 'Ada' : 'Tidak ada'}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {activeSession && (
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>Sesi Aktif</CardTitle>
                            <CardDescription>{activeSession.subject ?? activeSession.type}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                            <p>Token: {activeSession.qr_token}</p>
                            <p>Berakhir: {new Date(activeSession.ends_at).toLocaleString('id-ID')}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-6">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>Grid Absensi Harian</CardTitle>
                            <CardDescription>
                                Tampilan siswa dengan status absensi di setiap fase (Pagi, Kelas, Pulang)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceGrid attendance={attendance} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

TeacherAttendanceDaily.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'Absensi Harian',
            href: '/teacher/attendance/daily',
        },
    ],
};