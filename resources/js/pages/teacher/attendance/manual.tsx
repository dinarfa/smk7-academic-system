import { Head, router } from '@inertiajs/react';
import type {
    Check
} from 'lucide-react';
import {
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    RotateCcw,
    Save,
    ChevronRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

type Student = {
    id: number;
    name: string;
    class_id: number;
    class_name: string;
};

type ClassInfo = {
    id: number;
    name: string;
};

type ExistingRecord = {
    status: string;
    phase: string;
    source: string;
};

type ActiveSession = {
    id: number;
    type: string;
    ends_at: string;
    is_active: boolean;
};

type Props = {
    students: Student[];
    classes: ClassInfo[];
    existingRecords: Record<number, ExistingRecord>;
    activeSession: ActiveSession | null;
    date: string;
};

type StudentStatus = 'present' | 'late' | 'absent';

const createInitialStatuses = (
    existingRecords: Record<number, ExistingRecord>,
    phase: string,
): Map<number, StudentStatus> => {
    const initial = new Map<number, StudentStatus>();

    for (const [studentId, record] of Object.entries(existingRecords)) {
        if (
            record.phase === phase &&
            (record.status === 'present' || record.status === 'late' || record.status === 'absent')
        ) {
            initial.set(Number(studentId), record.status as StudentStatus);
        }
    }

    return initial;
};

const statusConfig: Record<StudentStatus, { label: string; shortLabel: string; color: string; bgColor: string; icon: typeof Check }> = {
    present: { label: 'Hadir', shortLabel: 'H', color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-500', icon: CheckCircle2 },
    late: { label: 'Terlambat', shortLabel: 'T', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-500', icon: Clock },
    absent: { label: 'Tidak Hadir', shortLabel: 'A', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-500', icon: XCircle },
};

const phaseLabels: Record<string, string> = {
    morning: 'Pagi',
    class: 'Kelas',
    dismissal: 'Pulang',
};

export default function ManualAttendance({
    students,
    classes,
    existingRecords,
    date,
}: Props) {
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [phase, setPhase] = useState('morning');
    const [statuses, setStatuses] = useState<Map<number, StudentStatus>>(
        () => createInitialStatuses(existingRecords, 'morning'),
    );

    // When phase changes, load existing records for that phase
    const handlePhaseChange = (newPhase: string) => {
        setPhase(newPhase);
        setStatuses(createInitialStatuses(existingRecords, newPhase));
    };
    const [processing, setProcessing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
            const matchesClass = selectedClass === null || s.class_id === selectedClass;

            return matchesSearch && matchesClass;
        });
    }, [students, search, selectedClass]);

    const summary = useMemo(() => {
        const counts = { present: 0, late: 0, absent: 0, unset: 0 };

        for (const s of filteredStudents) {
            const status = statuses.get(s.id);

            if (status) {
                counts[status]++;
            } else {
                counts.unset++;
            }
        }

        return counts;
    }, [filteredStudents, statuses]);

    const setStatus = (studentId: number, status: StudentStatus) => {
        setStatuses((prev) => {
            const next = new Map(prev);

            if (next.get(studentId) === status) {
                next.delete(studentId);
            } else {
                next.set(studentId, status);
            }

            return next;
        });
    };

    const markAll = (status: StudentStatus) => {
        setStatuses((prev) => {
            const next = new Map(prev);

            for (const s of filteredStudents) {
                next.set(s.id, status);
            }

            return next;
        });
    };

    const resetAll = () => {
        setStatuses(new Map());
    };

    const handleSubmit = async () => {
        setProcessing(true);

        try {
            const payload = {
                phase,
                students: Array.from(statuses.entries()).map(([studentId, status]) => ({
                    student_id: studentId,
                    status,
                })),
            };

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

            const res = await fetch('/teacher/attendance/manual', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.message || 'Gagal menyimpan absensi manual');

                return;
            }

            setShowConfirm(false);
            router.visit('/teacher/attendance');
        } catch {
            alert('Kesalahan jaringan');
        } finally {
            setProcessing(false);
        }
    };

    const getExistingBadge = (studentId: number) => {
        const record = existingRecords[studentId];

        if (!record || record.phase !== phase) {
            return null;
        }

        const cfg = record.status === 'present'
            ? statusConfig.present
            : record.status === 'late'
                ? statusConfig.late
                : record.status === 'absent'
                    ? statusConfig.absent
                    : null;

        if (!cfg) {
            return null;
        }

        return (
            <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                Sudah: {cfg.label} ({record.source})
            </Badge>
        );
    };

    return (
        <>
            <Head title="Absensi Manual" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Absensi Manual</h1>
                        <p className="mt-1 text-muted-foreground">
                            Tanggal: {date} &middot; {students.length} siswa di kelas perwalian
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowConfirm(true)}
                        disabled={statuses.size === 0 || processing}
                        className="gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Simpan ({statuses.size} siswa)
                    </Button>
                </div>

                {/* Controls */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Phase */}
                            <div className="space-y-2">
                                <Label>Fase Absensi</Label>
                                <div className="flex gap-1 rounded-lg border p-1">
                                    {Object.entries(phaseLabels).map(([value, label]) => (
                                        <button
                                            key={value}
                                            onClick={() => handlePhaseChange(value)}
                                            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${phase === value
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-muted'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Class filter */}
                            {classes.length > 1 && (
                                <div className="space-y-2">
                                    <Label>Filter Kelas</Label>
                                    <div className="flex flex-wrap gap-1">
                                        <button
                                            onClick={() => setSelectedClass(null)}
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${selectedClass === null
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'border text-muted-foreground hover:bg-muted'
                                                }`}
                                        >
                                            Semua
                                        </button>
                                        {classes.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setSelectedClass(c.id)}
                                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${selectedClass === c.id
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border text-muted-foreground hover:bg-muted'
                                                    }`}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Search */}
                            <div className="space-y-2">
                                <Label>Cari Siswa</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Nama siswa..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Bulk actions */}
                            <div className="space-y-2">
                                <Label>Aksi Cepat</Label>
                                <div className="flex gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => markAll('present')}
                                        className="flex-1 gap-1 text-emerald-600 hover:text-emerald-700"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Semua Hadir
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => markAll('absent')}
                                        className="flex-1 gap-1 text-red-600 hover:text-red-700"
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Semua Absen
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetAll}
                                        className="gap-1"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary bar */}
                <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{filteredStudents.length} siswa</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{summary.present}</span> Hadir
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{summary.late}</span> Terlambat
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{summary.absent}</span> Tidak Hadir
                        </span>
                    </div>
                    {summary.unset > 0 && (
                        <>
                            <div className="h-4 w-px bg-border" />
                            <span className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{summary.unset}</span> belum diisi
                            </span>
                        </>
                    )}
                </div>

                {/* Student list */}
                <Card>
                    <CardContent className="p-0">
                        {filteredStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <Users className="mb-3 h-10 w-10 opacity-40" />
                                <p className="text-sm">
                                    {search ? 'Tidak ada siswa yang cocok dengan pencarian' : 'Tidak ada siswa di kelas perwalian'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredStudents.map((student, index) => {
                                    const currentStatus = statuses.get(student.id);

                                    return (
                                        <div
                                            key={student.id}
                                            className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30 ${currentStatus ? 'bg-muted/10' : ''
                                                }`}
                                        >
                                            <span className="w-8 text-right text-sm text-muted-foreground">
                                                {index + 1}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">{student.class_name}</p>
                                            </div>

                                            {getExistingBadge(student.id) && (
                                                <div className="hidden sm:block">
                                                    {getExistingBadge(student.id)}
                                                </div>
                                            )}

                                            <div className="flex gap-1.5">
                                                {(Object.keys(statusConfig) as StudentStatus[]).map((status) => {
                                                    const cfg = statusConfig[status];
                                                    const isActive = currentStatus === status;
                                                    const Icon = cfg.icon;

                                                    return (
                                                        <button
                                                            key={status}
                                                            onClick={() => setStatus(student.id, status)}
                                                            title={cfg.label}
                                                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive
                                                                    ? `${cfg.bgColor} text-white shadow-md`
                                                                    : 'border bg-background text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted'
                                                                }`}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                            <span className="hidden sm:inline">{cfg.label}</span>
                                                            <span className="sm:hidden">{cfg.shortLabel}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bottom save bar */}
                {statuses.size > 0 && (
                    <div className="sticky bottom-4 flex items-center justify-between rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                                {statuses.size} siswa dipilih
                            </span>
                            <div className="hidden gap-2 sm:flex">
                                <Badge variant="outline" className="gap-1 text-emerald-600">
                                    <CheckCircle2 className="h-3 w-3" /> {summary.present}
                                </Badge>
                                <Badge variant="outline" className="gap-1 text-amber-600">
                                    <Clock className="h-3 w-3" /> {summary.late}
                                </Badge>
                                <Badge variant="outline" className="gap-1 text-red-600">
                                    <XCircle className="h-3 w-3" /> {summary.absent}
                                </Badge>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowConfirm(true)}
                            disabled={processing}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Simpan
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Confirmation dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Simpan Absensi</DialogTitle>
                        <DialogDescription>
                            Pastikan data yang dimasukkan sudah benar. Data yang sudah disimpan dapat diubah.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Fase</p>
                            <p className="font-medium">{phaseLabels[phase]}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg border p-3 text-center">
                                <p className="text-2xl font-bold text-emerald-600">{summary.present}</p>
                                <p className="text-xs text-muted-foreground">Hadir</p>
                            </div>
                            <div className="rounded-lg border p-3 text-center">
                                <p className="text-2xl font-bold text-amber-600">{summary.late}</p>
                                <p className="text-xs text-muted-foreground">Terlambat</p>
                            </div>
                            <div className="rounded-lg border p-3 text-center">
                                <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                                <p className="text-xs text-muted-foreground">Tidak Hadir</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing} className="gap-2">
                            {processing ? 'Menyimpan...' : 'Ya, Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ManualAttendance.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Absensi Manual', href: '#' },
    ],
};
