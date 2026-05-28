import { Head, Form, router } from '@inertiajs/react';
import { Clock, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import AttendanceSessionController from '@/actions/App/Http/Controllers/Teacher/AttendanceSessionController';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

type ActiveSession = {
    id: number;
    type: 'morning' | 'subject' | 'dismissal';
    subject: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    records_count: number;
    qr_payload: string;
    qr_svg: string;
};

type RecentRecord = {
    id: number;
    student_name: string | null;
    session_type: string | null;
    subject: string | null;
    scanned_at: string | null;
};

type Subject = {
    id: number;
    name: string;
    code: string;
};

type Props = {
    subjects: Subject[];
    summary: {
        students_count: number;
        active_sessions_count: number;
        today_records_count: number;
    };
    activeSessions: ActiveSession[];
    recentRecords: RecentRecord[];
};

function typeLabel(type: ActiveSession['type']): string {
    if (type === 'morning') {
        return 'Absen Pagi';
    }

    if (type === 'subject') {
        return 'Absen Mata Pelajaran';
    }

    return 'Absen Pulang';
}

export default function TeacherDashboard({
    summary,
    activeSessions,
}: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    // Reload when any active session expires
    useEffect(() => {
        const hasExpired = activeSessions.some((session) => {
            if (!session.ends_at) {
                return false;
            }

            return new Date(session.ends_at).getTime() - currentTime.getTime() <= 0;
        });

        if (hasExpired) {
            router.reload({ only: ['summary', 'activeSessions', 'recentRecords'] });
        }
    }, [currentTime, activeSessions]);

    const getTimeRemaining = (endTime: string | null) => {
        if (!endTime) {
            return '—';
        }

        const diff = new Date(endTime).getTime() - currentTime.getTime();

        if (diff <= 0) {
            return 'Expired';
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Filter out expired sessions client-side for immediate UI update
    const visibleSessions = activeSessions.filter(
        (s) => !s.ends_at || new Date(s.ends_at).getTime() - currentTime.getTime() > 0,
    );

    return (
        <>
            <Head title="Dashboard Guru" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard Guru</h1>
                    <p className="text-sm text-muted-foreground">Kelola absensi dan aktivitas siswa</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard icon={Users} label="Total Siswa" value={summary.students_count} />
                    <StatCard icon={Zap} label="Sesi Aktif" value={summary.active_sessions_count} />
                    <StatCard icon={Clock} label="Absensi Hari Ini" value={summary.today_records_count} />
                </div>

                {visibleSessions.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-medium text-foreground">Sesi Aktif</h2>
                            <Badge variant="secondary">{visibleSessions.length}</Badge>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {visibleSessions.map((session) => (
                                <Card key={session.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base">
                                                    {typeLabel(session.type)}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {session.subject ?? 'Tanpa mata pelajaran'}
                                                </p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <StatusBadge status="active" />
                                                <p className="text-lg font-semibold tabular-nums text-foreground">
                                                    {getTimeRemaining(session.ends_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                                            <span className="text-sm text-muted-foreground">Tercatat</span>
                                            <span className="text-sm font-medium text-foreground">
                                                {session.records_count} siswa
                                            </span>
                                        </div>

                                        {session.is_active && (
                                            <Form
                                                {...AttendanceSessionController.close.form(session.id)}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        variant="destructive"
                                                        className="w-full"
                                                        disabled={processing}
                                                    >
                                                        {processing ? 'Menutup...' : 'Tutup Sesi'}
                                                    </Button>
                                                )}
                                            </Form>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

TeacherDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
    ],
};
