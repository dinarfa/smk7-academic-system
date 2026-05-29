import { Head, Link } from '@inertiajs/react';
import { Download, FileSpreadsheet, FileText, ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';

interface SchoolClass {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
    school_class_id: number | null;
}

interface Props {
    schoolClasses: SchoolClass[];
    subjects: Subject[];
}

export default function ExportAttendance({ schoolClasses, subjects }: Props) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [classId, setClassId] = useState<string>('');
    const [subjectId, setSubjectId] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    const filteredSubjects = useMemo(() => {
        if (!classId) {
            return subjects;
        }

        return subjects.filter((s) => s.school_class_id === Number(classId));
    }, [subjects, classId]);

    const getCsrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';

    const handleExport = async (format: 'csv' | 'xlsx') => {
        setProcessing(true);

        try {
            const response = await fetch('/teacher/attendance/export', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(getCsrfToken()
                        ? { 'X-CSRF-TOKEN': getCsrfToken() }
                        : {}),
                },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    format,
                    ...(classId ? { classId: Number(classId) } : {}),
                    ...(subjectId ? { subjectId: Number(subjectId) } : {}),
                }),
            });

            if (!response.ok) {
                alert('Gagal mengekspor data');

                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const classSuffix = classId
                ? `-${schoolClasses.find((c) => c.id === Number(classId))?.name ?? 'kelas'}`
                : '';
            const subjectSuffix = subjectId
                ? `-${subjects.find((s) => s.id === Number(subjectId))?.name ?? 'mapel'}`
                : '';
            link.download = `absensi${classSuffix}${subjectSuffix}-${startDate || 'mulai'}-sampai-${endDate || 'akhir'}.${format}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch {
            alert('Kesalahan saat mengekspor');
        } finally {
            setProcessing(false);
        }
    };

    const handleClassChange = (value: string) => {
        setClassId(value);

        // Reset subject if it doesn't belong to the new class
        if (value && subjectId) {
            const belongs = subjects.some(
                (s) =>
                    s.id === Number(subjectId) &&
                    s.school_class_id === Number(value),
            );

            if (!belongs) {
                setSubjectId('');
            }
        }
    };

    return (
        <>
            <Head title="Ekspor Absensi" />

            <div className="space-y-6 p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Ekspor Absensi
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Unduh data absensi siswa dalam format CSV atau XLSX
                        berdasarkan rentang tanggal, kelas, dan mata pelajaran.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    {/* Export Form */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold text-foreground">
                                Filter Ekspor
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Pilih kelas, mata pelajaran, dan rentang tanggal
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Tanggal Mulai</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Tanggal Akhir</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        {schoolClasses.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <Label htmlFor="classId">Kelas</Label>
                                <Select
                                    value={classId || 'all'}
                                    onValueChange={(v) =>
                                        handleClassChange(v === 'all' ? '' : v)
                                    }
                                >
                                    <SelectTrigger
                                        id="classId"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Semua Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Kelas
                                        </SelectItem>
                                        {schoolClasses.map((cls) => (
                                            <SelectItem
                                                key={cls.id}
                                                value={String(cls.id)}
                                            >
                                                {cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Kosongkan untuk mengekspor semua kelas
                                </p>
                            </div>
                        )}

                        {filteredSubjects.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <Label htmlFor="subjectId">
                                    Mata Pelajaran
                                </Label>
                                <Select
                                    value={subjectId || 'all'}
                                    onValueChange={(v) =>
                                        setSubjectId(v === 'all' ? '' : v)
                                    }
                                >
                                    <SelectTrigger
                                        id="subjectId"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Semua Mata Pelajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Mata Pelajaran
                                        </SelectItem>
                                        {filteredSubjects.map((subject) => (
                                            <SelectItem
                                                key={subject.id}
                                                value={String(subject.id)}
                                            >
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {classId
                                        ? 'Mata pelajaran untuk kelas yang dipilih'
                                        : 'Kosongkan untuk mengekspor semua mata pelajaran'}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button
                                onClick={() => handleExport('csv')}
                                disabled={processing}
                                className="gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                {processing ? 'Mengekspor...' : 'Ekspor CSV'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleExport('xlsx')}
                                disabled={processing}
                                className="gap-2"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {processing ? 'Mengekspor...' : 'Ekspor XLSX'}
                            </Button>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="space-y-6">
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="text-base font-semibold text-foreground">
                                Format Tersedia
                            </h3>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            CSV
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Kompatibel dengan Excel, Google
                                            Sheets
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            XLSX
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Format Excel asli, mendukung
                                            formatting
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="text-base font-semibold text-foreground">
                                Kolom Data
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Data yang diekspor mencakup: Nama Siswa, Email,
                                Tipe Sesi, Mata Pelajaran, Fase, Sumber, Status,
                                Keterangan Izin, dan Waktu Scan.
                            </p>
                        </div>

                        <Button asChild variant="outline" className="w-full">
                            <Link
                                href="/teacher/attendance/daily"
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Absensi Harian
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

ExportAttendance.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Ekspor Absensi', href: '#' },
    ],
};
