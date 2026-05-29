import { Head, Link, Form, router } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { Maximize2, CalendarClock, AlertTriangle, Scan } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import AttendanceSessionController from '@/actions/App/Http/Controllers/Teacher/AttendanceSessionController';
import QRDisplay from '@/components/QRDisplayV2';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

const DAY_NAMES = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
];

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
    qr_expires_at: string | null;
};

type CurrentSchedule = {
    type: 'morning' | 'subject' | 'dismissal';
    subject_name: string | null;
    class_name: string | null;
    starts_at: string;
    ends_at: string;
    day_of_week: number;
} | null;

type SubjectGroup = {
    key: string;
    name: string;
    code: string;
    classes: { id: number; name: string }[];
};

type Props = {
    active_session: ActiveSession | null;
    current_schedule: CurrentSchedule;
    subject_groups?: SubjectGroup[];
    accessible_classes?: { id: number; name: string }[];
};

function typeLabel(type: ActiveSession['type']): string {
    return SCHEDULE_TYPE_LABELS[type ?? ''] ?? 'Sesi Absensi';
}

export default function TeacherAttendanceQr({
    active_session: activeSession,
    current_schedule: currentSchedule,
    subject_groups: subjectGroups = [],
    accessible_classes: accessibleClasses = [],
}: Props) {
    const [showQrPopup, setShowQrPopup] = useState(false);
    const [popupTimeRemaining, setPopupTimeRemaining] = useState('');
    const [selectedSubjectKey, setSelectedSubjectKey] = useState('');
    const popupExpiredRef = useRef(false);

    // Local QR state for rotation updates (avoids full page reload)
    const [qrPayload, setQrPayload] = useState(activeSession?.qr_payload ?? '');
    const [qrSvg, setQrSvg] = useState(activeSession?.qr_svg ?? '');
    const [rotationCountdown, setRotationCountdown] = useState<number | null>(
        null,
    );

    // Sync local QR state when activeSession prop changes
    useEffect(() => {
        if (activeSession) {
            setQrPayload(activeSession.qr_payload);
            setQrSvg(activeSession.qr_svg);
        }
    }, [activeSession?.qr_payload, activeSession?.qr_svg]);

    // Poll for token rotation and attendance count updates every 3 seconds
    useEffect(() => {
        if (!activeSession?.is_active) {
            return;
        }

        const pollInterval = setInterval(async () => {
            // Check if the QR token has expired and needs rotation
            const expiresAt = activeSession.qr_expires_at
                ? new Date(activeSession.qr_expires_at)
                : null;
            const now = new Date();

            if (expiresAt && now >= expiresAt) {
                // Token expired — request rotation via API
                try {
                    const response = await fetch(
                        `/teacher/attendance-sessions/${activeSession.id}/rotate-qr`,
                        {
                            method: 'POST',
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest',
                                Accept: 'application/json',
                                'X-CSRF-TOKEN':
                                    document
                                        .querySelector(
                                            'meta[name="csrf-token"]',
                                        )
                                        ?.getAttribute('content') ?? '',
                            },
                        },
                    );

                    if (response.ok) {
                        const data = await response.json();
                        setQrPayload(data.qr_payload);
                        setQrSvg(data.qr_svg);
                        // Update the expires_at in the active session for countdown
                        activeSession.qr_expires_at = data.qr_expires_at;
                    }
                } catch {
                    // Silently fail — will retry on next poll
                }
            }

            // Also reload record count from server
            router.reload({ only: ['active_session'] });
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [
        activeSession?.is_active,
        activeSession?.id,
        activeSession?.qr_expires_at,
    ]);

    // Rotation countdown timer (updates every 500ms)
    useEffect(() => {
        if (!activeSession?.is_active || !activeSession?.qr_expires_at) {
            setRotationCountdown(null);

            return;
        }

        const updateCountdown = () => {
            const expiresAt = new Date(activeSession.qr_expires_at!);
            const now = new Date();
            const remaining = Math.max(
                0,
                Math.ceil((expiresAt.getTime() - now.getTime()) / 1000),
            );
            setRotationCountdown(remaining);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 500);

        return () => clearInterval(interval);
    }, [activeSession?.is_active, activeSession?.qr_expires_at]);

    const selectedSubject =
        subjectGroups.find((group) => group.key === selectedSubjectKey) ?? null;
    const selectedClasses = selectedSubject?.classes ?? accessibleClasses ?? [];
    const canOpenSession = selectedClasses.length > 0;

    useEffect(() => {
        if (!showQrPopup || !activeSession?.ends_at) {
            return;
        }

        popupExpiredRef.current = false;

        const updateTimer = () => {
            const now = new Date();
            const end = new Date(activeSession.ends_at!);
            const start = activeSession.starts_at
                ? new Date(activeSession.starts_at)
                : new Date(now.getTime() - 5 * 60000);
            const total = Math.max(1, end.getTime() - start.getTime());
            const remaining = end.getTime() - now.getTime();

            if (remaining <= 0) {
                setPopupTimeRemaining('KADALUARSA');

                if (!popupExpiredRef.current) {
                    popupExpiredRef.current = true;
                }

                return;
            }

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setPopupTimeRemaining(
                `${minutes}:${seconds.toString().padStart(2, '0')}`,
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 500);

        return () => clearInterval(interval);
    }, [showQrPopup, activeSession?.ends_at, activeSession?.starts_at]);

    const popupIsExpired = popupTimeRemaining === 'KADALUARSA';

    return (
        <>
            <Head title="QR Absensi Guru" />

            <div className="space-y-6 p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        QR Absensi Guru
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Hanya sesi yang sedang aktif sekarang yang bisa dibuka.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>QR Aktif</CardTitle>
                            <CardDescription>
                                {activeSession
                                    ? typeLabel(activeSession.type)
                                    : 'Belum ada sesi aktif'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeSession ? (
                                <>
                                    <QRDisplay
                                        qrSvg={qrSvg}
                                        startTime={
                                            activeSession.starts_at ?? ''
                                        }
                                        endTime={activeSession.ends_at ?? ''}
                                        sessionType={typeLabel(
                                            activeSession.type,
                                        )}
                                        onExpire={() => {
                                            router.reload({
                                                only: ['active_session'],
                                            });
                                        }}
                                    />
                                    {rotationCountdown !== null && (
                                        <div className="mt-2 text-center">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                                                Rotasi QR dalam{' '}
                                                {rotationCountdown}s
                                            </span>
                                        </div>
                                    )}
                                    <div className="mt-4 flex justify-center">
                                        <Button
                                            onClick={() => setShowQrPopup(true)}
                                            className="gap-2"
                                        >
                                            <Maximize2 className="h-4 w-4" />
                                            Tampilkan QR Besar
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Tidak ada sesi aktif. Buka sesi baru
                                        dari panel kanan.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {/* ── Session controls + schedule ── */}
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                    Kontrol Sesi
                                </CardTitle>
                                <CardDescription>
                                    {activeSession
                                        ? 'Tutup sesi aktif atau refresh status QR.'
                                        : 'Pilih sesi yang sedang aktif untuk membuka QR absensi.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentSchedule ? (
                                    <div className="space-y-1 rounded-lg border border-border bg-muted/30 px-4 py-3">
                                        <p className="text-sm font-semibold text-foreground">
                                            {SCHEDULE_TYPE_LABELS[
                                                currentSchedule.type
                                            ] ?? currentSchedule.type}
                                            {currentSchedule.subject_name
                                                ? ` — ${currentSchedule.subject_name}`
                                                : ''}
                                            {currentSchedule.class_name
                                                ? ` · ${currentSchedule.class_name}`
                                                : ''}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {
                                                DAY_NAMES[
                                                    currentSchedule.day_of_week
                                                ]
                                            }{' '}
                                            · {currentSchedule.starts_at} –{' '}
                                            {currentSchedule.ends_at}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                Tidak ada sesi aktif sekarang
                                            </p>
                                            <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/80">
                                                Tunggu jam pelajaran aktif. Sesi
                                                tidak bisa dibuka di luar jam.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {activeSession ? (
                                    <Form
                                        {...AttendanceSessionController.close.form(
                                            activeSession.id,
                                        )}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                className="w-full"
                                                disabled={processing}
                                            >
                                                Tutup Sesi QR
                                            </Button>
                                        )}
                                    </Form>
                                ) : (
                                    <Form
                                        {...AttendanceSessionController.store.form()}
                                    >
                                        {({ processing }) => (
                                            <>
                                                <div className="mb-2 space-y-2">
                                                    <Label htmlFor="subject_key">
                                                        Pilih Mata Pelajaran
                                                    </Label>
                                                    <select
                                                        id="subject_key"
                                                        name="subject_key"
                                                        value={
                                                            selectedSubjectKey
                                                        }
                                                        onChange={(event) =>
                                                            setSelectedSubjectKey(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                                    >
                                                        <option value="">
                                                            Pilih Mata Pelajaran
                                                        </option>
                                                        {subjectGroups.map(
                                                            (group) => (
                                                                <option
                                                                    key={
                                                                        group.key
                                                                    }
                                                                    value={
                                                                        group.key
                                                                    }
                                                                >
                                                                    {group.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="mb-2 space-y-2">
                                                    <Label htmlFor="class_id">
                                                        Pilih Kelas
                                                    </Label>
                                                    <select
                                                        key={
                                                            selectedSubjectKey ||
                                                            'no-subject'
                                                        }
                                                        id="class_id"
                                                        name="class_id"
                                                        defaultValue=""
                                                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <option value="">
                                                            Pilih Kelas
                                                        </option>
                                                        {selectedClasses.map(
                                                            (c) => (
                                                                <option
                                                                    key={c.id}
                                                                    value={c.id}
                                                                >
                                                                    {c.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                {subjectGroups.length === 0 && (
                                                    <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
                                                        Anda belum memiliki
                                                        relasi mata
                                                        pelajaran-kelas. Hubungi
                                                        admin untuk penugasan
                                                        mapel.
                                                    </div>
                                                )}

                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        !canOpenSession
                                                    }
                                                    className="w-full gap-2"
                                                >
                                                    <Scan className="h-4 w-4" />
                                                    {processing
                                                        ? 'Membuka...'
                                                        : 'Buka QR Sesi Aktif'}
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                )}

                                <Button
                                    asChild
                                    variant="secondary"
                                    className="w-full"
                                >
                                    <Link href="/teacher/attendance/daily">
                                        Lihat Absensi Harian
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/teacher/attendance/export">
                                        Ekspor Absensi
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
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
                                <CardDescription>
                                    Ringkasan sesi yang sedang aktif sekarang.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {activeSession ? (
                                    <>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <InfoRow
                                                label="Tipe"
                                                value={typeLabel(
                                                    activeSession.type,
                                                )}
                                            />
                                            <InfoRow
                                                label="Status"
                                                value={
                                                    activeSession.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'
                                                }
                                            />
                                            <InfoRow
                                                label="Mapel"
                                                value={
                                                    activeSession.subject ?? '-'
                                                }
                                            />
                                            <InfoRow
                                                label="Tercatat"
                                                value={`${activeSession.records_count} siswa`}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="token">
                                                Token QR
                                            </Label>
                                            <Input
                                                id="token"
                                                readOnly
                                                value={qrPayload}
                                            />
                                            {rotationCountdown !== null && (
                                                <p className="text-xs text-blue-500">
                                                    Rotasi otomatis dalam{' '}
                                                    {rotationCountdown} detik
                                                </p>
                                            )}
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
                    <DialogContent className="sm:max-w-md">
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="rounded-lg border bg-background p-4">
                                <div
                                    className="[&_svg]:h-full [&_svg]:w-full"
                                    style={{ width: 320, height: 320 }}
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(qrSvg),
                                    }}
                                />
                            </div>
                            <div className="space-y-1 text-center">
                                <h2 className="text-lg font-semibold">
                                    {typeLabel(activeSession.type)}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {activeSession.subject ??
                                        'Tanpa mata pelajaran'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-center">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Sisa Waktu
                                    </p>
                                    <p
                                        className={`text-lg font-semibold tabular-nums ${popupIsExpired ? 'text-destructive' : 'text-foreground'}`}
                                    >
                                        {popupIsExpired
                                            ? 'Kadaluarsa'
                                            : popupTimeRemaining}
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-border" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Tercatat
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {activeSession.records_count}
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-border" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Token
                                    </p>
                                    <p className="font-mono text-xs break-all">
                                        {qrPayload}
                                    </p>
                                    {rotationCountdown !== null && (
                                        <p className="text-xs text-muted-foreground">
                                            Rotasi dalam {rotationCountdown}s
                                        </p>
                                    )}
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
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-xs tracking-wider text-muted-foreground uppercase">
                {label}
            </p>
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
