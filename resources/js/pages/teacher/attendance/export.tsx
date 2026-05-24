import { Head, Link } from '@inertiajs/react';
import { Download, FileSpreadsheet, FileText, ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        if (!classId) return subjects;
        return subjects.filter((s) => s.school_class_id === Number(classId));
    }, [subjects, classId]);

    const getCsrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    const handleExport = async (format: 'csv' | 'xlsx') => {
        setProcessing(true);

        try {
            const response = await fetch('/teacher/attendance/export', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(getCsrfToken() ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
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
                (s) => s.id === Number(subjectId) && s.school_class_id === Number(value),
            );
            if (!belongs) setSubjectId('');
        }
    };

    return (
        <>
            <Head title="Ekspor Absensi" />

            <div className="space-y-6 p-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Ekspor Data
                    </p>
                    <h1 className="text-3xl font-semibold text-foreground">Ekspor Absensi</h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Unduh data absensi siswa dalam format CSV atau XLSX berdasarkan rentang tanggal, kelas, dan mata pelajaran.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    {/* Export Form */}
                    <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/25">
                                <Download className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                    Filter Ekspor
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pilih kelas, mata pelajaran, dan rentang tanggal
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Tanggal Mulai
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-10 rounded-xl border-slate-200/80 bg-white/80 font-medium backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Tanggal Akhir
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-10 rounded-xl border-slate-200/80 bg-white/80 font-medium backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                                />
                            </div>
                        </div>

                        {schoolClasses.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <Label htmlFor="classId" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Kelas
                                </Label>
                                <select
                                    id="classId"
                                    value={classId}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 font-medium text-sm backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                                >
                                    <option value="">Semua Kelas</option>
                                    {schoolClasses.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Kosongkan untuk mengekspor semua kelas
                                </p>
                            </div>
                        )}

                        {filteredSubjects.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <Label htmlFor="subjectId" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Mata Pelajaran
                                </Label>
                                <select
                                    id="subjectId"
                                    value={subjectId}
                                    onChange={(e) => setSubjectId(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 font-medium text-sm backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                                >
                                    <option value="">Semua Mata Pelajaran</option>
                                    {filteredSubjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    {classId ? 'Mata pelajaran untuk kelas yang dipilih' : 'Kosongkan untuk mengekspor semua mata pelajaran'}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button
                                onClick={() => handleExport('csv')}
                                disabled={processing}
                                className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/30"
                            >
                                <FileText className="h-4 w-4" />
                                {processing ? 'Mengekspor...' : 'Ekspor CSV'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleExport('xlsx')}
                                disabled={processing}
                                className="gap-2 rounded-xl border-slate-200/80 font-semibold backdrop-blur-sm dark:border-white/10"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {processing ? 'Mengekspor...' : 'Ekspor XLSX'}
                            </Button>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                Format Tersedia
                            </h3>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">CSV</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Kompatibel dengan Excel, Google Sheets</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                                        <FileSpreadsheet className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">XLSX</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Format Excel asli, mendukung formatting</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                Kolom Data
                            </h3>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Data yang diekspor mencakup: Nama Siswa, Email, Tipe Sesi, Mata Pelajaran, Fase, Sumber, Status, Keterangan Izin, dan Waktu Scan.
                            </p>
                        </div>

                        <Button asChild variant="outline" className="w-full rounded-xl">
                            <Link href="/teacher/attendance/daily" className="gap-2">
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
