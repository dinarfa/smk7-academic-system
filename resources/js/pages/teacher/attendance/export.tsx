import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export default function ExportAttendance() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [processing, setProcessing] = useState(false);

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
                body: JSON.stringify({ startDate, endDate, format }),
            });

            if (!response.ok) {
                alert('Gagal mengekspor data');
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `absensi-${startDate || 'mulai'}-sampai-${endDate || 'akhir'}.${format}`;
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

    return (
        <>
            <Head title="Ekspor Absensi" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Ekspor Absensi</h1>
                    <p className="text-muted-foreground">Unduh data absensi dalam format CSV atau XLSX</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Rentang Tanggal
                        </CardTitle>
                        <CardDescription>
                            Pilih tanggal awal dan akhir untuk mengekspor data absensi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Tanggal Mulai</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Tanggal Akhir</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

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
                                variant="secondary"
                                onClick={() => handleExport('xlsx')}
                                disabled={processing}
                                className="gap-2"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {processing ? 'Mengekspor...' : 'Ekspor XLSX'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
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
