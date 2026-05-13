import { Head, Form, Link } from '@inertiajs/react';
import AttendanceSessionController from '@/actions/App/Http/Controllers/Teacher/AttendanceSessionController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { QrCode, Clock, Users, Zap } from 'lucide-react';

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

type Props = {
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
    recentRecords,
}: Props) {
    return (
        <>
            <Head title="Dashboard Guru" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Dashboard Guru</h1>
                    <p className="mt-2 text-muted-foreground">Kelola absensi dan aktivitas siswa</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="bg-blue-50 dark:bg-blue-950 pb-3">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-xs font-medium">Total Siswa</CardDescription>
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <CardTitle className="text-2xl font-bold">{summary.students_count}</CardTitle>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="bg-amber-50 dark:bg-amber-950 pb-3">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-xs font-medium">Sesi Aktif</CardDescription>
                                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <CardTitle className="text-2xl font-bold">{summary.active_sessions_count}</CardTitle>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="bg-emerald-50 dark:bg-emerald-950 pb-3">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-xs font-medium">Absensi Hari Ini</CardDescription>
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
                                    <Clock className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <CardTitle className="text-2xl font-bold">{summary.today_records_count}</CardTitle>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Quick Start QR */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="w-5 h-5" />
                                Mulai Absensi QR
                            </CardTitle>
                            <CardDescription>Buat sesi QR baru untuk absensi cepat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form
                                {...AttendanceSessionController.store.form()}
                                className="grid gap-4 md:grid-cols-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="type" className="text-xs font-semibold">Jenis</Label>
                                            <select
                                                id="type"
                                                name="type"
                                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
                                                defaultValue="morning"
                                            >
                                                <option value="morning">Pagi</option>
                                                <option value="subject">Mapel</option>
                                                <option value="dismissal">Pulang</option>
                                            </select>
                                            {errors.type && (
                                                <p className="text-xs text-red-600">{errors.type}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="subject" className="text-xs font-semibold">Mata Pelajaran</Label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                placeholder="Opsional"
                                                className="h-9"
                                            />
                                            {errors.subject && (
                                                <p className="text-xs text-red-600">{errors.subject}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="duration_minutes" className="text-xs font-semibold">Durasi</Label>
                                            <Input
                                                id="duration_minutes"
                                                name="duration_minutes"
                                                type="number"
                                                min={1}
                                                max={480}
                                                defaultValue={30}
                                                className="h-9"
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <Button className="w-full h-9" disabled={processing}>
                                                {processing ? 'Memproses...' : 'Buka QR'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Akses Cepat</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button asChild variant="outline" className="w-full justify-start" size="sm">
                                <Link href="/teacher/attendance/qr">
                                    <QrCode className="w-4 h-4 mr-2" />
                                    Tampilkan QR
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start" size="sm">
                                <Link href="/teacher/attendance/daily">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Grid Absensi
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start" size="sm">
                                <Link href="/teacher/students">
                                    <Users className="w-4 h-4 mr-2" />
                                    Kelola Siswa
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Sesi Aktif ({activeSessions.length})</h2>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {activeSessions.map((session) => (
                                <Card key={session.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base">{typeLabel(session.type)}</CardTitle>
                                                <CardDescription className="text-xs mt-1">
                                                    {session.subject ?? 'Tanpa mata pelajaran'}
                                                </CardDescription>
                                            </div>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-950 rounded-full">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                <span className="text-xs font-medium">Aktif</span>
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div
                                            className="rounded-lg border bg-white dark:bg-slate-900 p-4 flex items-center justify-center"
                                            dangerouslySetInnerHTML={{ __html: session.qr_svg }}
                                        />

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Token:</span>
                                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{session.qr_payload}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Tercatat:</span>
                                                <span className="font-semibold">{session.records_count} siswa</span>
                                            </div>
                                        </div>

                                        {session.is_active && (
                                            <Form
                                                {...AttendanceSessionController.close.form(session.id)}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        variant="destructive"
                                                        size="sm"
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

                {/* Recent Records */}
                {recentRecords.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Absensi Terbaru</CardTitle>
                            <CardDescription>10 scan terbaru dari siswa</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {recentRecords.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{record.student_name}</p>
                                            <p className="text-xs text-muted-foreground">{record.subject} • {record.session_type}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {record.scanned_at ? new Date(record.scanned_at).toLocaleString('id-ID') : '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
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
