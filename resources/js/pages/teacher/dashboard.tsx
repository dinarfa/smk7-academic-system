import { Head, Form } from '@inertiajs/react';
import AttendanceSessionController from '@/actions/App/Http/Controllers/Teacher/AttendanceSessionController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total Siswa</CardDescription>
                            <CardTitle>{summary.students_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Sesi QR Aktif</CardDescription>
                            <CardTitle>{summary.active_sessions_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Absensi Hari Ini</CardDescription>
                            <CardTitle>{summary.today_records_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Buka QR Absensi</CardTitle>
                        <CardDescription>
                            Pilih jenis QR untuk absen pagi, mata pelajaran, atau pulang.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...AttendanceSessionController.store.form()}
                            className="grid gap-4 md:grid-cols-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Jenis QR</Label>
                                        <select
                                            id="type"
                                            name="type"
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
                                            defaultValue="morning"
                                        >
                                            <option value="morning">Absen Pagi</option>
                                            <option value="subject">Absen Mata Pelajaran</option>
                                            <option value="dismissal">Absen Pulang</option>
                                        </select>
                                        {errors.type && (
                                            <p className="text-sm text-red-600">{errors.type}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="subject">Mata Pelajaran</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            placeholder="Opsional / wajib jika mapel"
                                        />
                                        {errors.subject && (
                                            <p className="text-sm text-red-600">{errors.subject}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="duration_minutes">Durasi (menit)</Label>
                                        <Input
                                            id="duration_minutes"
                                            name="duration_minutes"
                                            type="number"
                                            min={1}
                                            max={480}
                                            defaultValue={30}
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <Button className="w-full" disabled={processing}>
                                            Buka QR
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    {activeSessions.map((session) => (
                        <Card key={session.id}>
                            <CardHeader>
                                <CardTitle>{typeLabel(session.type)}</CardTitle>
                                <CardDescription>
                                    {session.subject ?? 'Tanpa mata pelajaran'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    className="rounded-lg border bg-white p-4"
                                    dangerouslySetInnerHTML={{ __html: session.qr_svg }}
                                />

                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>Token: {session.qr_payload}</p>
                                    <p>Tercatat: {session.records_count} siswa</p>
                                </div>

                                {session.is_active && (
                                    <Form
                                        {...AttendanceSessionController.close.form(session.id)}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                disabled={processing}
                                            >
                                                Tutup Sesi QR
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Status Absensi Siswa (Terbaru)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2 pr-3">Siswa</th>
                                        <th className="py-2 pr-3">Jenis</th>
                                        <th className="py-2 pr-3">Mapel</th>
                                        <th className="py-2">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRecords.length === 0 && (
                                        <tr>
                                            <td
                                                className="py-4 text-muted-foreground"
                                                colSpan={4}
                                            >
                                                Belum ada data absensi.
                                            </td>
                                        </tr>
                                    )}
                                    {recentRecords.map((record) => (
                                        <tr key={record.id} className="border-b">
                                            <td className="py-2 pr-3">{record.student_name}</td>
                                            <td className="py-2 pr-3">{record.session_type}</td>
                                            <td className="py-2 pr-3">{record.subject ?? '-'}</td>
                                            <td className="py-2">
                                                {record.scanned_at
                                                    ? new Date(record.scanned_at).toLocaleString('id-ID')
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
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
