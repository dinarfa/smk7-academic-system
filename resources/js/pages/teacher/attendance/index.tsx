import { Head, router, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import QRScanner from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';

interface AttendanceRecord {
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
}

interface ActiveSession {
    id: number;
    qr_token: string;
    type: string;
    ends_at: string;
}

interface DailyAttendanceData {
    attendance: Record<string, AttendanceRecord[]>;
    active_session: ActiveSession | null;
    date: string;
}

export default function Index({ attendance, active_session: activeSession, date }: DailyAttendanceData) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showScanner, setShowScanner] = useState(false);
    const [exportProcessing, setExportProcessing] = useState(false);

    const getCsrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    const handleExport = async (format: 'csv' | 'xlsx') => {
        setExportProcessing(true);
        try {
            const payload = {
                startDate: date,
                endDate: date,
                format,
            };

            const res = await fetch('/teacher/attendance/export', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(getCsrfToken() ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const txt = await res.text();
                console.error('Export failed', txt);
                alert('Export gagal');
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `teacher-attendance-${date}-${ts}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Kesalahan saat mengekspor');
        } finally {
            setExportProcessing(false);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // When the active session expires, reload the page data so the UI
    // reflects the server-side state (getActiveSession filters ends_at > now()).
    // Retries each tick until server confirms expiry (handles clock skew).
    useEffect(() => {
        if (!activeSession) {
            return;
        }

        const end = new Date(activeSession.ends_at);
        const remaining = end.getTime() - currentTime.getTime();

        if (remaining <= 0) {
            router.reload({ only: ['attendance', 'active_session'] });
        }
    }, [currentTime, activeSession]);

    const getTimeRemaining = (endTime: string) => {
        const end = new Date(endTime);
        const diff = end.getTime() - currentTime.getTime();

        if (diff <= 0) return 'Expired';

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getStatusVariant = (status: string): 'default' | 'success' | 'destructive' | 'outline' | 'secondary' => {
        switch (status) {
            case 'present': return 'success';
            case 'late': return 'secondary';
            case 'absent': return 'destructive';
            default: return 'outline';
        }
    };

    const phases = ['morning', 'class', 'dismissal'];

    return (
        <>
            <Head title="Absensi Harian" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Absensi Harian</h1>
                    <p className="mt-2 text-muted-foreground">Kelola absensi siswa untuk {date}</p>
                </div>

                {/* Active Session Section */}
                {activeSession && getTimeRemaining(activeSession.ends_at) !== 'Expired' && (
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Sesi Aktif</CardTitle>
                                <CardDescription className="capitalize">{activeSession.type}</CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary">
                                    {getTimeRemaining(activeSession.ends_at)}
                                </div>
                                <div className="text-xs text-muted-foreground">Waktu tersisa</div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* QR Code Display */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="inline-block p-4 border rounded-lg bg-background">
                                        <img
                                            src={`/api/qr/${activeSession.qr_token}`}
                                            alt="QR Code"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        Tunjukkan QR ke siswa untuk pemindaian
                                    </p>
                                </div>

                                {/* Session Controls */}
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => setShowScanner(!showScanner)}
                                        variant={showScanner ? 'secondary' : 'default'}
                                        className="w-full"
                                    >
                                        {showScanner ? 'Tutup Pemindai' : 'Buka Pemindai QR'}
                                    </Button>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleExport('csv')}
                                                disabled={exportProcessing}
                                                className="w-full text-sm"
                                            >
                                                {exportProcessing ? 'Mengekspor...' : 'Export CSV'}
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                onClick={() => handleExport('xlsx')}
                                                disabled={exportProcessing}
                                                className="w-full text-sm"
                                            >
                                                {exportProcessing ? 'Mengekspor...' : 'Export XLSX'}
                                            </Button>
                                        </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Buat QR Baru
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        Tutup Sesi
                                    </Button>
                                </div>
                            </div>

                            {/* QR Scanner */}
                            {showScanner && (
                                <div className="mt-6 border-t pt-6">
                                    <QRScanner
                                        onScan={async (data) => {
                                            setShowScanner(false);
                                            try {
                                                const fd = new FormData();
                                                fd.append('qr_token', data);
                                                const res = await fetch('/student/attendance/scan', {
                                                    method: 'POST',
                                                    body: fd,
                                                    credentials: 'same-origin',
                                                    headers: {
                                                        'X-Requested-With': 'XMLHttpRequest',
                                                        'Accept': 'application/json',
                                                        ...(getCsrfToken() ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
                                                    },
                                                });

                                                if (!res.ok) {
                                                    const text = await res.text();
                                                    console.error('Scan error response', text);
                                                    alert('Pemindaian gagal');
                                                } else {
                                                    window.location.reload();
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Kesalahan pemindaian');
                                            }
                                        }}
                                        onError={(error) => {
                                            console.error('Scan error:', error);
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Attendance by Phase */}
                <div className="space-y-6">
                    {phases.map(phase => (
                        <Card key={phase}>
                            <CardHeader>
                                <CardTitle className="capitalize">{phase} - Absensi</CardTitle>
                                <CardDescription>
                                    {attendance[phase]?.length ?? 0} siswa tercatat
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {attendance[phase]?.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Siswa</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Waktu</TableHead>
                                                <TableHead>Sumber</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attendance[phase].map(record => (
                                                <TableRow key={record.id}>
                                                    <TableCell className="font-medium">
                                                        {record.student.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(record.status)} className="capitalize">
                                                            {record.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(record.scanned_at).toLocaleTimeString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {record.source}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">
                                            Belum ada catatan absensi untuk fase {phase}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Manual Attendance Section */}
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
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'Absensi Harian',
            href: '#',
        },
    ],
};