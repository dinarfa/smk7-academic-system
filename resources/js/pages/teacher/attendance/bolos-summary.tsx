import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboard } from '@/routes';
import { AlertTriangle, RefreshCw, Download, Users } from 'lucide-react';

type MissingEntry = {
    session_id: number;
    session_type: string;
    session_subject: string | null;
    student_id: number;
    student_name: string | null;
};

export default function BolosSummary() {
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState<boolean>(false);
    const [summary, setSummary] = useState<{
        missing_count: number;
        expected_students: number;
        missing: MissingEntry[];
    } | null>(null);

    const getCsrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/teacher/attendance/bolos-summary?date=${date}`, {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setSummary(json.summary ?? json);
        } catch {
            alert('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [date]);

    const handleExport = async () => {
        try {
            const response = await fetch('/teacher/attendance/export', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/csv',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(getCsrfToken() ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
                },
                body: JSON.stringify({ startDate: date, endDate: date }),
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rekap-bolos-${date}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch {
            alert('Gagal mengekspor');
        }
    };

    return (
        <>
            <Head title="Rekap Bolos" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Rekap Bolos</h1>
                        <p className="text-muted-foreground">Siswa yang tidak memiliki catatan absensi</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={fetchSummary} disabled={loading} className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleExport} className="gap-2">
                            <Download className="h-4 w-4" />
                            Ekspor CSV
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Tanggal</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-auto"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {summary && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/15">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Bolos</p>
                                            <p className="text-2xl font-bold text-red-600">{summary.missing_count}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-500/15">
                                            <Users className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Siswa</p>
                                            <p className="text-2xl font-bold">{summary.expected_students}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                                            <Users className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Hadir</p>
                                            <p className="text-2xl font-bold text-emerald-600">
                                                {summary.expected_students - summary.missing_count}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Siswa Bolos</CardTitle>
                                <CardDescription>
                                    {summary.missing_count} siswa tidak memiliki catatan absensi pada tanggal {date}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {summary.missing.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>No</TableHead>
                                                <TableHead>Nama Siswa</TableHead>
                                                <TableHead>Sesi</TableHead>
                                                <TableHead>Tipe</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {summary.missing.map((m, idx) => (
                                                <TableRow key={`${m.session_id}-${m.student_id}`}>
                                                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                                                    <TableCell className="font-medium">{m.student_name ?? '-'}</TableCell>
                                                    <TableCell>{m.session_subject ?? '-'}</TableCell>
                                                    <TableCell className="capitalize">{m.session_type}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <Users className="mb-3 h-10 w-10 opacity-40" />
                                        <p className="text-sm">Semua siswa memiliki catatan absensi hari ini</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Memuat data...
                    </div>
                )}
            </div>
        </>
    );
}

BolosSummary.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Rekap Bolos', href: '#' },
    ],
};
