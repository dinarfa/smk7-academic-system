import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import AttendanceController from '@/actions/App/Http/Controllers/Student/AttendanceController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function StudentDashboard({ summary, recentRecords }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        qr_token: '',
    });

    const [scannerActive, setScannerActive] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const scannerRef = useRef<QrScanner | null>(null);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.destroy();
            }
        };
    }, []);

    async function startScanner(): Promise<void> {
        setScannerError(null);

        if (!videoRef.current) {
            setScannerError('Tidak bisa inisialisasi video element.');
            return;
        }

        try {
            const scanner = new QrScanner(
                videoRef.current,
                (result) => {
                    const qrToken = result.data;
                    setData('qr_token', qrToken);
                    stopScanner();
                    router.post(AttendanceController.scan.url(), {
                        qr_token: qrToken,
                    }, {
                        onSuccess: () => reset('qr_token'),
                    });
                },
                {
                    onDecodeError: () => {},
                    preferredCamera: 'environment',
                    maxScansPerSecond: 5,
                    highlightCodeOutline: true,
                }
            );

            scannerRef.current = scanner;
            
            await scanner.start();
            setScannerActive(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'unknown';
            console.error('[QR Scanner] Error:', errorMessage);

            if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
                setScannerError('Izin akses kamera ditolak. Buka pengaturan browser > Izin > Kamera dan aktifkan untuk situs ini.');
            } else if (errorMessage.includes('NotFoundError')) {
                setScannerError('Kamera tidak ditemukan. Gunakan input token manual.');
            } else if (errorMessage.includes('NotReadableError') || errorMessage.includes('already in use')) {
                setScannerError('Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain dan coba lagi.');
            } else {
                setScannerError(` Error: ${errorMessage}. Gunakan input token manual.`);
            }
        }
    }

    function stopScanner(): void {
        setScannerActive(false);

        if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current.destroy();
            scannerRef.current = null;
        }
    }

    function submitToken(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        post(AttendanceController.scan.url(), {
            onSuccess: () => reset('qr_token'),
        });
    }

    return (
        <>
            <Head title="Dashboard Siswa" />

            <div className="space-y-6 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total Kehadiran</CardDescription>
                            <CardTitle>{summary.total_attendance}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Kehadiran Hari Ini</CardDescription>
                            <CardTitle>{summary.today_attendance}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Scan QR Absensi</CardTitle>
                        <CardDescription>
                            Scan QR dari guru menggunakan kamera. Jika kamera tidak bisa diakses dari device lain, paste token QR secara manual.
                            {!window.location.protocol.startsWith('https') && !['localhost', '127.0.0.1'].includes(window.location.hostname) && (
                                <div className="mt-2 rounded bg-blue-50 p-2 text-xs text-blue-700">
                                    💡 Akses dari IP address: Browser memerlukan HTTPS untuk kamera. Gunakan token manual atau setup HTTPS dengan ngrok.
                                </div>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {!scannerActive ? (
                                <Button type="button" onClick={startScanner}>
                                    Mulai Scan Kamera
                                </Button>
                            ) : (
                                <Button type="button" variant="outline" onClick={stopScanner}>
                                    Hentikan Scan
                                </Button>
                            )}

                            <Link
                                href={AttendanceController.index()}
                                className="inline-flex h-9 items-center rounded-md border px-3 text-sm"
                            >
                                Lihat Riwayat Kehadiran
                            </Link>
                        </div>

                        {scannerError && <p className="text-sm text-amber-600">{scannerError}</p>}

                        <video
                            ref={videoRef}
                            className="max-h-72 w-full rounded-lg border bg-black"
                            autoPlay
                            playsInline
                            muted
                        />

                        <form onSubmit={submitToken} className="grid gap-3 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <Label htmlFor="qr_token">Token / Hasil Scan QR</Label>
                                <Input
                                    id="qr_token"
                                    value={data.qr_token}
                                    onChange={(event) => setData('qr_token', event.target.value)}
                                    placeholder="attendance:01J..."
                                />
                                {errors.qr_token && (
                                    <p className="text-sm text-red-600">{errors.qr_token}</p>
                                )}
                            </div>

                            <div className="flex items-end">
                                <Button type="submit" disabled={processing} className="w-full">
                                    Kirim Absensi
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2 pr-3">Jenis Absensi</th>
                                        <th className="py-2 pr-3">Mata Pelajaran</th>
                                        <th className="py-2">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRecords.length === 0 && (
                                        <tr>
                                            <td
                                                className="py-4 text-muted-foreground"
                                                colSpan={3}
                                            >
                                                Belum ada data absensi.
                                            </td>
                                        </tr>
                                    )}
                                    {recentRecords.map((record) => (
                                        <tr key={record.id} className="border-b">
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

StudentDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Siswa',
            href: dashboard(),
        },
    ],
};
