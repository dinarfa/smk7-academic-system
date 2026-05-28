import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    Clock,
    TrendingUp,
} from 'lucide-react';

import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

type RecentRecord = {
    id: number;
    session_type: string | null;
    subject: string | null;
    scanned_at: string | null;
};

type Props = {
    summary: {
        total_attendance: number;
        today_attendance: number;
    };
    recentRecords: RecentRecord[];
};

const sessionTypeLabels: Record<string, string> = {
    morning: 'Absen Pagi',
    subject: 'Absen Mapel',
    dismissal: 'Absen Pulang',
};

export default function StudentDashboard({
    summary,
    recentRecords,
}: Props) {
    return (
        <>
            <Head title="Dashboard Siswa" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Pantau riwayat kehadiran Anda</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard icon={TrendingUp} label="Total Kehadiran" value={summary.total_attendance} />
                    <StatCard icon={CheckCircle2} label="Hari Ini" value={summary.today_attendance} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Kehadiran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentRecords.length > 0 ? (
                            <div>
                                {recentRecords.map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between py-3 border-b border-border last:border-0"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {sessionTypeLabels[record.session_type ?? ''] ??
                                                        record.session_type ??
                                                        'Sesi'}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {record.subject ?? 'Tanpa mata pelajaran'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="ml-4 shrink-0 text-xs tabular-nums text-muted-foreground">
                                            {record.scanned_at
                                                ? new Date(record.scanned_at).toLocaleString('id-ID')
                                                : '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                                    <ClipboardList className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground">Belum Ada Riwayat</h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Riwayat absensi akan muncul di sini setelah Anda melakukan kehadiran.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StudentDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Siswa',
            href: dashboard(),
        },
    ],
};
