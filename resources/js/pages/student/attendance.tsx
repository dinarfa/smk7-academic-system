import { Head, Link } from '@inertiajs/react';
import {
    ClipboardList,
    QrCode,
    ArrowRight,
} from 'lucide-react';
import { useMemo } from 'react';
import AttendanceController from '@/actions/App/Http/Controllers/Student/AttendanceController';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

type AttendanceRecord = {
    id: number;
    status: string;
    scanned_at: string | null;
    session: {
        type: string | null;
        subject: string | null;
        starts_at: string | null;
        ends_at: string | null;
    };
};

type Props = {
    records: {
        data: AttendanceRecord[];
    };
    overallStats?: {
        total: number;
        present: number;
        late: number;
        absent: number;
    };
};

const sessionTypeLabels: Record<string, string> = {
    morning: 'Absen Pagi',
    subject: 'Absen Mapel',
    dismissal: 'Absen Pulang',
};

export default function StudentAttendance({ records, overallStats }: Props) {
    const computedStats = useMemo(() => {
        const counts = { total: records.data.length, present: 0, late: 0, absent: 0 };
        records.data.forEach((r) => {
            if (r.status === 'present') {
                counts.present++;
            } else if (r.status === 'late') {
                counts.late++;
            } else if (r.status === 'absent') {
                counts.absent++;
            }
        });

        return counts;
    }, [records.data]);

    const stats = overallStats ?? computedStats;

    return (
        <>
            <Head title="Kehadiran Saya" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kehadiran Saya</h1>
                        <p className="text-sm text-muted-foreground">Riwayat kehadiran dan status absensi Anda</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/student/attendance/scan">
                                <QrCode className="mr-2 h-4 w-4" />
                                Scan QR
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" size="sm">
                            <Link href={dashboard()}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={ClipboardList} label="Total Absensi" value={stats.total} />
                    <StatCard icon={ClipboardList} label="Hadir" value={stats.present} />
                    <StatCard icon={ClipboardList} label="Terlambat" value={stats.late} />
                    <StatCard icon={ClipboardList} label="Tidak Hadir" value={stats.absent} />
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Riwayat Kehadiran</CardTitle>
                            <span className="text-sm text-muted-foreground">
                                {records.data.length} catatan
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {records.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                                    <ClipboardList className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground">Belum ada kehadiran tercatat</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Scan QR dari guru untuk mulai absensi
                                </p>
                                <Button asChild className="mt-4" size="sm">
                                    <Link href="/student/attendance/scan">
                                        <QrCode className="mr-2 h-4 w-4" />
                                        Scan QR Sekarang
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div>
                                {records.data.map((record) => {
                                    const typeLabel = sessionTypeLabels[record.session.type ?? ''] ?? record.session.type ?? 'Sesi';

                                    return (
                                        <div
                                            key={record.id}
                                            className="flex items-center justify-between py-3 border-b border-border last:border-0"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-foreground">
                                                            {typeLabel}
                                                        </p>
                                                        <StatusBadge status={record.status} />
                                                    </div>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {record.session.subject ?? 'Tanpa mata pelajaran'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-4 shrink-0 text-right">
                                                <p className="text-xs tabular-nums text-muted-foreground">
                                                    {record.scanned_at
                                                        ? new Date(record.scanned_at).toLocaleString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {records.data.length > 0 && (
                    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
                        <span className="text-xs font-medium text-muted-foreground">Keterangan:</span>
                        <StatusBadge status="present" />
                        <StatusBadge status="late" />
                        <StatusBadge status="absent" label="Tidak Hadir" />
                    </div>
                )}
            </div>
        </>
    );
}

StudentAttendance.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Siswa',
            href: dashboard(),
        },
        {
            title: 'Kehadiran Saya',
            href: AttendanceController.index(),
        },
    ],
};
