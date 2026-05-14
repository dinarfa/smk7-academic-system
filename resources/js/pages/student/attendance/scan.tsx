import { Head, Link, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import QRScanner from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

export default function StudentAttendanceScan() {
    const { data, setData, processing, errors, reset } = useForm({
        qr_token: '',
    });
    const [message, setMessage] = useState<string | null>(null);
    const manualInputRef = useRef<HTMLInputElement | null>(null);
    const [scannerError, setScannerError] = useState<string | null>(null);

    const isSecureContext = typeof window !== 'undefined'
        && (window.location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(window.location.hostname));

    const submitToken = (qrToken: string) => {
        setMessage(null);
        setData('qr_token', qrToken);

        router.post('/student/attendance/scan', {
            qr_token: qrToken,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setMessage('Absensi terkirim. Jika sesi masih aktif, data sudah disimpan.');
                reset('qr_token');
            },
            onError: () => {
                setMessage('Pemindaian gagal. Coba token manual atau pindai ulang.');
            },
        });
    };

    return (
        <>
            <Head title="Scan Kehadiran" />

            <div className="space-y-6 p-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        QR Attendance
                    </p>
                    <h1 className="text-3xl font-semibold text-foreground">Scan Kehadiran</h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Arahkan kamera ke QR dari guru, atau masukkan token secara manual jika kamera tidak tersedia.
                    </p>
                </div>

                {message && (
                    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
                        {message}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>Pemindai Kamera</CardTitle>
                            <CardDescription>
                                Pindai QR dengan kamera belakang perangkat. Scanner otomatis berhenti saat token terbaca.
                                {!isSecureContext && (
                                    <span className="mt-2 block text-amber-600">
                                        Kamera sering memerlukan HTTPS. Jika memakai IP address biasa, gunakan input manual.
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <QRScanner onScan={submitToken} onError={(e) => setScannerError(e)} />

                            {scannerError && (
                                <div className="mt-3 text-sm text-amber-600">{scannerError}</div>
                            )}

                            <div className="flex flex-wrap gap-3">
                                <Button asChild variant="outline">
                                    <Link href="/student/attendance">Lihat Riwayat</Link>
                                </Button>
                                <Button asChild variant="secondary">
                                    <Link href="/student/dashboard">Kembali ke Dashboard</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>Input Manual</CardTitle>
                            <CardDescription>
                                Gunakan token saat kamera bermasalah atau perangkat tidak mendukung pemindaian QR.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="space-y-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    submitToken(data.qr_token);
                                }}
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="qr_token">Token QR</Label>
                                    <Input
                                        id="qr_token"
                                        value={data.qr_token}
                                        onChange={(event) => setData('qr_token', event.target.value)}
                                        placeholder="attendance:01J..."
                                        autoComplete="off"
                                        ref={(el: HTMLInputElement) => (manualInputRef.current = el)}
                                    />
                                    {errors.qr_token && (
                                        <p className="text-sm text-red-600">{errors.qr_token}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    {processing ? 'Mengirim...' : 'Kirim Absensi'}
                                </Button>
                            </form>

                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => manualInputRef.current?.focus()}
                                    className="text-sm text-muted-foreground underline"
                                >
                                    Fokus ke input manual
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

StudentAttendanceScan.layout = {
    breadcrumbs: [
        { title: 'Dashboard Siswa', href: dashboard() },
        { title: 'Scan Kehadiran', href: '#' },
    ],
};