import { Head, Link, Form } from '@inertiajs/react';
import AttendanceSessionController from '@/actions/App/Http/Controllers/Teacher/AttendanceSessionController';
import QRDisplay from '@/components/QRDisplayV2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

type ActiveSession = {
    id: number;
    type: 'morning' | 'subject' | 'dismissal' | null;
    subject: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    records_count: number;
    qr_payload: string;
    qr_svg: string;
};

type Props = {
    active_session: ActiveSession | null;
};

function typeLabel(type: ActiveSession['type']): string {
    if (type === 'morning') {
        return 'Absen Pagi';
    }

    if (type === 'subject') {
        return 'Absen Mata Pelajaran';
    }

    if (type === 'dismissal') {
        return 'Absen Pulang';
    }

    return 'Sesi Absensi';
}

export default function TeacherAttendanceQr({ active_session: activeSession }: Props) {
    return (
        <>
            <Head title="QR Absensi Guru" />

            <div className="space-y-6 p-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Attendance QR
                    </p>
                    <h1 className="text-3xl font-semibold text-foreground">QR Absensi Guru</h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Tampilkan QR aktif ke siswa, tutup sesi saat selesai, dan buka sesi baru dari halaman ini.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>QR Aktif</CardTitle>
                            <CardDescription>
                                {activeSession ? typeLabel(activeSession.type) : 'Belum ada sesi aktif'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeSession ? (
                                <QRDisplay
                                    qrSvg={activeSession.qr_svg}
                                    startTime={activeSession.starts_at ?? ''}
                                    endTime={activeSession.ends_at ?? ''}
                                    sessionType={typeLabel(activeSession.type)}
                                    onExpire={() => {
                                        // let user know client-side when QR expires
                                        // server-side session remains until teacher closes it
                                        // we flash a small toast via Inertia if available
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-ignore
                                        if (typeof window !== 'undefined' && window.__inertia) {
                                            // no-op - Inertia server flash recommended
                                        }
                                    }}
                                />
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Tidak ada sesi aktif. Buka sesi baru dari panel kanan.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle>Kontrol Sesi</CardTitle>
                                <CardDescription>
                                    Tutup sesi aktif atau buka QR baru untuk kelas berikutnya.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {activeSession ? (
                                    <Form {...AttendanceSessionController.close.form(activeSession.id)}>
                                        {({ processing }) => (
                                            <Button type="submit" variant="destructive" className="w-full" disabled={processing}>
                                                Tutup Sesi QR
                                            </Button>
                                        )}
                                    </Form>
                                ) : null}

                                <Button asChild variant="outline" className="w-full">
                                    <Link href={dashboard()}>
                                        Buka Sesi Baru
                                    </Link>
                                </Button>

                                <Button asChild variant="secondary" className="w-full">
                                    <Link href="/teacher/attendance/daily">
                                        Lihat Absensi Harian
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle>Info Sesi</CardTitle>
                                <CardDescription>
                                    Ringkasan singkat sesi yang sedang aktif.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {activeSession ? (
                                    <>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <InfoRow label="Tipe" value={typeLabel(activeSession.type)} />
                                            <InfoRow label="Status" value={activeSession.is_active ? 'Aktif' : 'Nonaktif'} />
                                            <InfoRow label="Mapel" value={activeSession.subject ?? '-'} />
                                            <InfoRow label="Tercatat" value={`${activeSession.records_count} siswa`} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="token">Token QR</Label>
                                            <Input id="token" readOnly value={activeSession.qr_payload} />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Belum ada sesi aktif untuk ditampilkan.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium text-foreground">{value}</p>
        </div>
    );
}

TeacherAttendanceQr.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'QR Absensi',
            href: '/teacher/attendance/qr',
        },
    ],
};