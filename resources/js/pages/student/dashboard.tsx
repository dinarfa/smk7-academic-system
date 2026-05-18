import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    ClipboardList,
    Clock,
    History,
    Keyboard,
    QrCode,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react';
import QrScanner from 'qr-scanner';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import AttendanceController from '@/actions/App/Http/Controllers/Student/AttendanceController';
import { Button } from '@/components/ui/button';
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

const sessionTypeLabels: Record<string, string> = {
    morning: 'Absen Pagi',
    subject: 'Absen Mapel',
    dismissal: 'Absen Pulang',
};

export default function StudentDashboard({ summary, recentRecords }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        qr_token: '',
    });

    const [scannerActive, setScannerActive] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [lastScanResult, setLastScanResult] = useState<'success' | 'error' | null>(null);
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
        setLastScanResult(null);

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
                        onSuccess: () => {
                            reset('qr_token');
                            setLastScanResult('success');
                        },
                        onError: () => {
                            setLastScanResult('error');
                        },
                    });
                },
                {
                    onDecodeError: () => { },
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
                setScannerError(`Error: ${errorMessage}. Gunakan input token manual.`);
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
        setLastScanResult(null);

        post(AttendanceController.scan.url(), {
            onSuccess: () => {
                reset('qr_token');
                setLastScanResult('success');
            },
            onError: () => {
                setLastScanResult('error');
            },
        });
    }

    const isSecureContext = typeof window !== 'undefined'
        && (window.location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(window.location.hostname));

    return (
        <>
            <Head title="Dashboard Siswa">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Animated gradient background wrapper */}
            <div className="relative min-h-full" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {/* Animated gradient */}
                <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_25%,_#f0f9ff_50%,_#f8fafc_75%,_#eef2ff_100%)] bg-[length:400%_400%] animate-[gradient-shift_15s_ease_infinite] dark:bg-[linear-gradient(135deg,_#020617_0%,_#0f172a_25%,_#0c1222_50%,_#020617_75%,_#0f172a_100%)]" />

                {/* Floating decorative shapes */}
                <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-500/5" />
                <div className="pointer-events-none fixed top-1/4 -right-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-[80px] dark:bg-cyan-400/5" />
                <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-400/8 blur-[90px] dark:bg-indigo-400/4" />
                <div className="pointer-events-none fixed -bottom-20 right-1/4 h-64 w-64 rounded-full bg-sky-300/10 blur-[70px] dark:bg-sky-300/5" />

                {/* Grid pattern overlay */}
                <div className="pointer-events-none fixed inset-0 -z-[5] bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)]" />

                <div className="relative z-10 space-y-8 p-4 pb-12 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                            Dashboard Siswa
                        </h1>
                        <p className="text-base text-slate-500 dark:text-slate-400">
                            Pantau kehadiran dan lakukan absensi QR
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Total Kehadiran */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-blue-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:shadow-blue-500/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Total Kehadiran
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {summary.total_attendance}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-500/10" />
                        </div>

                        {/* Kehadiran Hari Ini */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-emerald-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:shadow-emerald-500/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Kehadiran Hari Ini
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {summary.today_attendance}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-emerald-500/10" />
                        </div>
                    </div>

                    {/* Scan QR + Quick Links */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Scan QR Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Camera Scanner */}
                            <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                <div className="px-6 pt-6 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/25">
                                            <Camera className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                                Scan QR Absensi
                                            </h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Arahkan kamera ke QR dari guru
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 px-6 pb-6">
                                    {!isSecureContext && (
                                        <div className="flex items-center gap-2 rounded-xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 backdrop-blur-sm dark:border-amber-500/20 dark:bg-amber-500/10">
                                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                                Akses dari IP address memerlukan HTTPS untuk kamera. Gunakan input manual jika kamera tidak berfungsi.
                                            </p>
                                        </div>
                                    )}

                                    {scannerError && (
                                        <div className="flex items-center gap-2 rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 backdrop-blur-sm dark:border-red-500/20 dark:bg-red-500/10">
                                            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                            <p className="text-xs font-medium text-red-700 dark:text-red-300">{scannerError}</p>
                                        </div>
                                    )}

                                    {lastScanResult === 'success' && (
                                        <div className="flex items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-4 py-3 backdrop-blur-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                                Absensi berhasil terkirim!
                                            </p>
                                        </div>
                                    )}

                                    {lastScanResult === 'error' && (
                                        <div className="flex items-center gap-2 rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 backdrop-blur-sm dark:border-red-500/20 dark:bg-red-500/10">
                                            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                            <p className="text-xs font-medium text-red-700 dark:text-red-300">
                                                Pemindaian gagal. Coba lagi atau gunakan input manual.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        {!scannerActive ? (
                                            <Button
                                                type="button"
                                                onClick={startScanner}
                                                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/30"
                                            >
                                                <Camera className="mr-2 h-4 w-4" />
                                                Mulai Scan Kamera
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={stopScanner}
                                                className="rounded-xl"
                                            >
                                                Hentikan Scan
                                            </Button>
                                        )}

                                        <Button asChild variant="outline" className="rounded-xl">
                                            <Link href="/student/attendance/scan">
                                                <QrCode className="mr-2 h-4 w-4" />
                                                Scanner Penuh
                                            </Link>
                                        </Button>
                                    </div>

                                    <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-slate-900 dark:border-white/10">
                                        <video
                                            ref={videoRef}
                                            className="aspect-video w-full object-cover"
                                            autoPlay
                                            playsInline
                                            muted
                                        />
                                        {!scannerActive && (
                                            <div className="flex aspect-video w-full items-center justify-center bg-slate-100 dark:bg-slate-800/50">
                                                <div className="text-center">
                                                    <Camera className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        Kamera belum aktif
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Manual Token Input */}
                            <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                <div className="px-6 pt-6 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/25">
                                            <Keyboard className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                                Input Manual
                                            </h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Masukkan token QR secara manual
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 pb-6">
                                    <form onSubmit={submitToken} className="grid gap-3 md:grid-cols-3">
                                        <div className="md:col-span-2">
                                            <Label htmlFor="qr_token" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                Token QR
                                            </Label>
                                            <Input
                                                id="qr_token"
                                                value={data.qr_token}
                                                onChange={(event) => setData('qr_token', event.target.value)}
                                                placeholder="attendance:01J..."
                                                className="mt-2 h-10 rounded-xl border-slate-200/80 bg-white/80 font-medium backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                                            />
                                            {errors.qr_token && (
                                                <p className="mt-1 text-xs font-medium text-red-500">{errors.qr_token}</p>
                                            )}
                                        </div>

                                        <div className="flex items-end">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="h-10 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-700 hover:to-purple-600 hover:shadow-xl hover:shadow-violet-500/30"
                                            >
                                                {processing ? 'Mengirim...' : 'Kirim Absensi'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-6">
                            <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                <div className="px-6 pt-6 pb-2">
                                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                        Akses Cepat
                                    </h2>
                                </div>
                                <div className="space-y-2 px-6 pb-6 pt-2">
                                    <Link
                                        href="/student/attendance/scan"
                                        className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-blue-300/50 hover:bg-blue-50/50 hover:text-blue-700 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:group-hover:bg-blue-500/25">
                                            <QrCode className="h-4 w-4" />
                                        </div>
                                        Scan QR
                                    </Link>
                                    <Link
                                        href={AttendanceController.index()}
                                        className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-emerald-300/50 hover:bg-emerald-50/50 hover:text-emerald-700 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:group-hover:bg-emerald-500/25">
                                            <ClipboardList className="h-4 w-4" />
                                        </div>
                                        Riwayat Kehadiran
                                    </Link>
                                </div>
                            </div>

                            {/* Status Info */}
                            <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                <div className="px-6 pt-6 pb-2">
                                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                        Tips
                                    </h2>
                                </div>
                                <div className="px-6 pb-6 pt-2">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 rounded-xl bg-slate-50/80 px-4 py-3 backdrop-blur-sm dark:bg-white/5">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                                                <span className="text-xs font-bold">1</span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                Minta QR dari guru, lalu scan menggunakan kamera atau masukkan token secara manual.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-xl bg-slate-50/80 px-4 py-3 backdrop-blur-sm dark:bg-white/5">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                                                <span className="text-xs font-bold">2</span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                Pastikan kamera memiliki izin akses di browser. Gunakan HTTPS jika mengakses dari IP address.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-xl bg-slate-50/80 px-4 py-3 backdrop-blur-sm dark:bg-white/5">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                                                <span className="text-xs font-bold">3</span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                Cek riwayat kehadiran untuk memastikan absensi sudah tercatat.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Records */}
                    {recentRecords.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                            <div className="px-6 pt-6 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25">
                                        <History className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                            Riwayat Terbaru
                                        </h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Absensi terakhir Anda
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5 px-6 pb-6 pt-3">
                                {recentRecords.map((record) => (
                                    <div
                                        key={record.id}
                                        className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3 transition-all duration-200 hover:border-slate-200/60 hover:bg-slate-50/80 hover:backdrop-blur-sm dark:hover:border-white/10 dark:hover:bg-white/5"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10">
                                                <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                    {sessionTypeLabels[record.session_type ?? ''] ?? record.session_type ?? 'Sesi'}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                                    {record.subject ?? 'Tanpa mata pelajaran'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="ml-4 shrink-0 text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500">
                                            {record.scanned_at
                                                ? new Date(record.scanned_at).toLocaleString('id-ID')
                                                : '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty state for recent records */}
                    {recentRecords.length === 0 && (
                        <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
                                    <ClipboardList className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Belum ada data absensi
                                </p>
                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                    Scan QR dari guru untuk mulai absensi
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Keyframe for gradient animation */}
            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>
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
