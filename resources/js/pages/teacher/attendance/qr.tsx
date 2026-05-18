import { Head, Link, Form, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AttendanceSessionController from '@/actions/App/Http/Controllers/Teacher/AttendanceSessionController';
import QRDisplay from '@/components/QRDisplayV2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { Maximize2, Minimize2, CalendarClock, AlertTriangle, Scan } from 'lucide-react';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
    morning: 'Absen Pagi',
    subject: 'Absen Mata Pelajaran',
    dismissal: 'Absen Pulang',
};

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

type CurrentSchedule = {
    type: 'morning' | 'subject' | 'dismissal';
    subject_name: string | null;
    starts_at: string;
    ends_at: string;
    day_of_week: number;
} | null;

type Props = {
    active_session: ActiveSession | null;
    current_schedule: CurrentSchedule;
    classes?: { id: number; name: string }[];
};

function typeLabel(type: ActiveSession['type']): string {
    return SCHEDULE_TYPE_LABELS[type ?? ''] ?? 'Sesi Absensi';
}

export default function TeacherAttendanceQr({ active_session: activeSession, current_schedule: currentSchedule, classes = [] }: Props) {
    const [showQrPopup, setShowQrPopup] = useState(false);
    const [popupTimeRemaining, setPopupTimeRemaining] = useState('');
    const [popupPercent, setPopupPercent] = useState(100);
    const popupExpiredRef = useRef(false);

    useEffect(() => {
        if (!showQrPopup || !activeSession?.ends_at) return;

        popupExpiredRef.current = false;

        const updateTimer = () => {
            const now = new Date();
            const end = new Date(activeSession.ends_at!);
            const start = activeSession.starts_at ? new Date(activeSession.starts_at) : new Date(now.getTime() - 5 * 60000);
            const total = Math.max(1, end.getTime() - start.getTime());
            const remaining = end.getTime() - now.getTime();

            if (remaining <= 0) {
                setPopupTimeRemaining('KADALUARSA');
                setPopupPercent(0);
                if (!popupExpiredRef.current) {
                    popupExpiredRef.current = true;
                }
                return;
            }

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setPopupTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            const p = Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
            setPopupPercent(p);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 500);
        return () => clearInterval(interval);
    }, [showQrPopup, activeSession?.ends_at, activeSession?.starts_at]);

    const popupRadius = 50;
    const popupCircumference = 2 * Math.PI * popupRadius;
    const popupStrokeDashoffset = popupCircumference * (1 - popupPercent / 100);
    const popupIsExpired = popupTimeRemaining === 'KADALUARSA';

    return (
        <>
            <Head title="QR Absensi Guru" />

            <div className="space-y-6 p-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        QR Absensi
                    </p>
                    <h1 className="text-3xl font-semibold text-foreground">QR Absensi Guru</h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Buka QR absensi — sistem otomatis mendeteksi sesi dari jadwal kelas Anda.
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
                                <>
                                    <QRDisplay
                                        qrSvg={activeSession.qr_svg}
                                        startTime={activeSession.starts_at ?? ''}
                                        endTime={activeSession.ends_at ?? ''}
                                        sessionType={typeLabel(activeSession.type)}
                                        onExpire={() => {
                                            router.reload({ only: ['active_session'] });
                                        }}
                                    />
                                    <div className="mt-4 flex justify-center">
                                        <Button
                                            onClick={() => setShowQrPopup(true)}
                                            className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/30"
                                        >
                                            <Maximize2 className="h-4 w-4" />
                                            Tampilkan QR Besar
                                        </Button>
                                    </div>
                                </>
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
                        {/* ── Detected schedule card ── */}
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                    Jadwal Sekarang
                                </CardTitle>
                                <CardDescription>
                                    Sesi yang akan dibuka otomatis berdasarkan jadwal kelas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {currentSchedule ? (
                                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-1">
                                        <p className="text-sm font-semibold text-foreground">
                                            {SCHEDULE_TYPE_LABELS[currentSchedule.type] ?? currentSchedule.type}
                                            {currentSchedule.subject_name ? ` — ${currentSchedule.subject_name}` : ''}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {DAY_NAMES[currentSchedule.day_of_week]} · {currentSchedule.starts_at} – {currentSchedule.ends_at}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                Tidak ada jadwal aktif
                                            </p>
                                            <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/80">
                                                Sesi pagi (30 menit) akan dibuka sebagai fallback.
                                                Hubungi admin untuk mengatur jadwal kelas.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* ── Session controls ── */}
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle>Kontrol Sesi</CardTitle>
                                <CardDescription>
                                    {activeSession
                                        ? 'Tutup sesi aktif atau refresh status QR.'
                                        : 'Klik tombol di bawah untuk membuka QR absensi.'}
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
                                ) : (
                                    <Form {...AttendanceSessionController.store.form()}>
                                        {({ processing }) => (
                                            <>
                                                {classes.length > 0 && (
                                                    <div className="mb-2">
                                                        <Label htmlFor="class_id" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Pilih Kelas</Label>
                                                        <select
                                                            id="class_id"
                                                            name="class_id"
                                                            className="mt-1 block w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                                                        >
                                                            <option value="">Gunakan kelas utama</option>
                                                            {classes.map((c) => (
                                                                <option key={c.id} value={c.id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-emerald-600"
                                                >
                                                    <Scan className="h-4 w-4" />
                                                    {processing ? 'Membuka...' : 'Buka QR Absensi'}
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                )}

                                <Button asChild variant="secondary" className="w-full">
                                    <Link href="/teacher/attendance/daily">
                                        Lihat Absensi Harian
                                    </Link>
                                </Button>

                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/teacher/attendance/export">
                                        Ekspor Absensi
                                    </Link>
                                </Button>

                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/teacher/attendance/recap">
                                        Rekap Absensi
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* ── Session info ── */}
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle>Info Sesi</CardTitle>
                                <CardDescription>Ringkasan sesi yang sedang aktif.</CardDescription>
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

            {/* QR Popup Dialog */}
            {activeSession && (
                <Dialog open={showQrPopup} onOpenChange={setShowQrPopup}>
                    <DialogContent className="max-w-2xl border-0 bg-gradient-to-br from-slate-900 to-slate-800 p-0 text-white shadow-2xl sm:rounded-2xl [&>button]:hidden">
                        <div className="relative p-6 sm:p-8">
                            <button
                                onClick={() => setShowQrPopup(false)}
                                className="absolute right-3 top-3 rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                            >
                                <Minimize2 className="h-4 w-4" />
                            </button>

                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                                {/* Left: QR Code */}
                                <div className="flex shrink-0 flex-col items-center gap-4">
                                    <div className="rounded-2xl bg-white p-5 shadow-2xl shadow-black/20">
                                        <div
                                            className="[&_svg]:h-full [&_svg]:w-full"
                                            style={{ width: 220, height: 220 }}
                                            dangerouslySetInnerHTML={{ __html: activeSession.qr_svg }}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-lg font-extrabold tracking-tight">
                                            {typeLabel(activeSession.type)}
                                        </h2>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {activeSession.subject ?? 'Tanpa mata pelajaran'}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Timer + Info */}
                                <div className="flex flex-1 flex-col items-center gap-4 sm:items-stretch">
                                    {/* Timer */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="relative">
                                            <svg className="h-24 w-24" viewBox="0 0 120 120">
                                                <g transform="translate(60,60)">
                                                    <circle r={popupRadius} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                                    <circle
                                                        r={popupRadius}
                                                        fill="transparent"
                                                        stroke={popupIsExpired ? '#ef4444' : '#3b82f6'}
                                                        strokeWidth="8"
                                                        strokeLinecap="round"
                                                        strokeDasharray={popupCircumference}
                                                        strokeDashoffset={popupStrokeDashoffset}
                                                        style={{ transition: 'stroke-dashoffset 0.35s linear' }}
                                                        transform="rotate(-90)"
                                                    />
                                                </g>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className={`text-xl font-extrabold tabular-nums ${popupIsExpired ? 'text-red-400' : 'text-white'}`}>
                                                    {popupIsExpired ? '0:00' : popupTimeRemaining}
                                                </span>
                                            </div>
                                        </div>
                                        {popupIsExpired ? (
                                            <div className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300">
                                                QR sudah kadaluarsa. Buka sesi baru.
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400">Sisa waktu sesi absensi</p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-3">
                                        <div className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-center backdrop-blur-sm">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tercatat</p>
                                            <p className="mt-0.5 text-lg font-bold">{activeSession.records_count}</p>
                                        </div>
                                        <div className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-center backdrop-blur-sm">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
                                            <p className="mt-0.5 text-lg font-bold text-emerald-400">Aktif</p>
                                        </div>
                                    </div>

                                    {/* Token */}
                                    <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center backdrop-blur-sm">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Token QR</p>
                                        <p className="mt-0.5 break-all font-mono text-xs font-medium text-white/90">
                                            {activeSession.qr_payload}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
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