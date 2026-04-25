import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
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
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    async function startScanner(): Promise<void> {
        setScannerError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });

            streamRef.current = stream;
            setScannerActive(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            const BarcodeDetectorApi = (window as unknown as {
                BarcodeDetector?: {
                    new (options?: { formats?: string[] }): {
                        detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
                    };
                };
            }).BarcodeDetector;

            if (!BarcodeDetectorApi) {
                setScannerError('Browser ini belum mendukung scan otomatis. Masukkan token manual.');

                return;
            }

            const detector = new BarcodeDetectorApi({ formats: ['qr_code'] });

            intervalRef.current = window.setInterval(async () => {
                if (!videoRef.current) {
                    return;
                }

                const results = await detector.detect(videoRef.current);
                const rawValue = results[0]?.rawValue;

                if (!rawValue) {
                    return;
                }

                setData('qr_token', rawValue);
                stopScanner();
                router.post(AttendanceController.scan.url(), {
                    qr_token: rawValue,
                }, {
                    onSuccess: () => reset('qr_token'),
                });
            }, 800);
        } catch {
            setScannerError('Akses kamera gagal. Gunakan input token manual.');
        }
    }

    function stopScanner(): void {
        setScannerActive(false);

        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
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
                            Scan QR dari guru, atau paste token QR jika kamera tidak tersedia.
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
