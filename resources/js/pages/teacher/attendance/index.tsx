import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import QRScanner from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { dashboard } from '@/routes';

interface AttendanceRecord {
    id: number;
    student_id: number;
    status: string;
    phase: string;
    source: string;
    scanned_at: string;
    student: {
        id: number;
        name: string;
    };
}

interface ActiveSession {
    id: number;
    qr_token: string;
    type: string;
    ends_at: string;
}

interface ClassStudent {
    id: number;
    name: string;
}

interface DailyAttendanceData {
    attendance: Record<string, AttendanceRecord[]>;
    active_session: ActiveSession | null;
    date: string;
}

export default function Index({ attendance, active_session: activeSession, date }: DailyAttendanceData) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showScanner, setShowScanner] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [manualSessionId, setManualSessionId] = useState('');
    const [manualPhase, setManualPhase] = useState('morning');
    const [manualProcessing, setManualProcessing] = useState(false);
    const [exportProcessing, setExportProcessing] = useState(false);
    const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Map<number, string>>(new Map());
    const [loadingStudents, setLoadingStudents] = useState(false);

    const getCsrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    const handleExport = async (format: 'csv' | 'xlsx') => {
        setExportProcessing(true);
        try {
            const payload = {
                startDate: date,
                endDate: date,
                format,
            };

            const res = await fetch('/teacher/attendance/export', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(getCsrfToken() ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const txt = await res.text();
                console.error('Export failed', txt);
                alert('Export gagal');
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `teacher-attendance-${date}-${ts}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Kesalahan saat mengekspor');
        } finally {
            setExportProcessing(false);
        }
    };

    const fetchClassStudents = async () => {
        setLoadingStudents(true);
        try {
            const res = await fetch('/teacher/class-students', {
                headers: {
                    'Accept': 'application/json',
                    ...(getCsrfToken() ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
                },
            });
            if (res.ok) {
                const data = await res.json();
                setClassStudents(data.students || []);
            }
        } catch (err) {
            console.error('Failed to fetch class students', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleOpenManual = () => {
        setShowManual(true);
        setSelectedStudents(new Map());
        fetchClassStudents();
    };

    const handleCloseManual = () => {
        setShowManual(false);
        setSelectedStudents(new Map());
        setClassStudents([]);
    };

    const toggleStudentStatus = (studentId: number, status: string) => {
        const newSelected = new Map(selectedStudents);
        if (newSelected.has(studentId) && newSelected.get(studentId) === status) {
            newSelected.delete(studentId);
        } else {
            newSelected.set(studentId, status);
        }
        setSelectedStudents(newSelected);
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getTimeRemaining = (endTime: string) => {
        const end = new Date(endTime);
        const diff = end.getTime() - currentTime.getTime();

        if (diff <= 0) return 'Expired';

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getStatusVariant = (status: string): 'default' | 'success' | 'destructive' | 'outline' | 'secondary' => {
        switch (status) {
            case 'present': return 'success';
            case 'late': return 'secondary';
            case 'absent': return 'destructive';
            default: return 'outline';
        }
    };

    const phases = ['morning', 'class', 'dismissal'];

    return (
        <>
            <Head title="Absensi Harian" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Absensi Harian</h1>
                    <p className="mt-2 text-muted-foreground">Kelola absensi siswa untuk {date}</p>
                </div>

                {/* Active Session Section */}
                {activeSession && (
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Sesi Aktif</CardTitle>
                                <CardDescription className="capitalize">{activeSession.type}</CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary">
                                    {getTimeRemaining(activeSession.ends_at)}
                                </div>
                                <div className="text-xs text-muted-foreground">Waktu tersisa</div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* QR Code Display */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="inline-block p-4 border rounded-lg bg-background">
                                        <img
                                            src={`/api/qr/${activeSession.qr_token}`}
                                            alt="QR Code"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        Tunjukkan QR ke siswa untuk pemindaian
                                    </p>
                                </div>

                                {/* Session Controls */}
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => setShowScanner(!showScanner)}
                                        variant={showScanner ? 'secondary' : 'default'}
                                        className="w-full"
                                    >
                                        {showScanner ? 'Tutup Pemindai' : 'Buka Pemindai QR'}
                                    </Button>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleExport('csv')}
                                                disabled={exportProcessing}
                                                className="w-full text-sm"
                                            >
                                                {exportProcessing ? 'Mengekspor...' : 'Export CSV'}
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                onClick={() => handleExport('xlsx')}
                                                disabled={exportProcessing}
                                                className="w-full text-sm"
                                            >
                                                {exportProcessing ? 'Mengekspor...' : 'Export XLSX'}
                                            </Button>
                                        </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Buat QR Baru
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        Tutup Sesi
                                    </Button>
                                </div>
                            </div>

                            {/* QR Scanner */}
                            {showScanner && (
                                <div className="mt-6 border-t pt-6">
                                    <QRScanner
                                        onScan={async (data) => {
                                            setShowScanner(false);
                                            try {
                                                const fd = new FormData();
                                                fd.append('qr_token', data);
                                                const res = await fetch('/student/attendance/scan', {
                                                    method: 'POST',
                                                    body: fd,
                                                    credentials: 'same-origin',
                                                    headers: {
                                                        'X-Requested-With': 'XMLHttpRequest',
                                                        'Accept': 'application/json',
                                                        ...(getCsrfToken() ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
                                                    },
                                                });

                                                if (!res.ok) {
                                                    const text = await res.text();
                                                    console.error('Scan error response', text);
                                                    alert('Pemindaian gagal');
                                                } else {
                                                    window.location.reload();
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Kesalahan pemindaian');
                                            }
                                        }}
                                        onError={(error) => {
                                            console.error('Scan error:', error);
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Attendance by Phase */}
                <div className="space-y-6">
                    {phases.map(phase => (
                        <Card key={phase}>
                            <CardHeader>
                                <CardTitle className="capitalize">{phase} - Absensi</CardTitle>
                                <CardDescription>
                                    {attendance[phase]?.length ?? 0} siswa tercatat
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {attendance[phase]?.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Siswa</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Waktu</TableHead>
                                                <TableHead>Sumber</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attendance[phase].map(record => (
                                                <TableRow key={record.id}>
                                                    <TableCell className="font-medium">
                                                        {record.student.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(record.status)} className="capitalize">
                                                            {record.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(record.scanned_at).toLocaleTimeString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {record.source}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">
                                            Belum ada catatan absensi untuk fase {phase}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Manual Attendance Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Absensi Manual</CardTitle>
                        <CardDescription>
                            Gunakan ketika pemindaian QR tidak tersedia atau untuk pembaruan massal.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Button onClick={handleOpenManual} className="w-full">
                            Buka Checklist Manual
                        </Button>
                    </CardContent>
                </Card>

                {/* Manual Attendance Dialog */}
                <Dialog open={showManual} onOpenChange={(open) => !open && handleCloseManual()}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Checklist Absensi Manual</DialogTitle>
                            <DialogDescription>
                                Pilih siswa dan atur status kehadiran mereka. Hanya siswa dari kelas Anda yang ditampilkan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="session-id">ID Sesi</Label>
                                    <Input
                                        id="session-id"
                                        value={manualSessionId}
                                        onChange={(e) => setManualSessionId(e.target.value)}
                                        placeholder="Masukkan ID sesi"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phase">Fase</Label>
                                    <Select value={manualPhase} onValueChange={setManualPhase}>
                                        <SelectTrigger id="phase">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="morning">Pagi</SelectItem>
                                            <SelectItem value="class">Kelas</SelectItem>
                                            <SelectItem value="dismissal">Pulang</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Students List */}
                            <div>
                                <Label>Siswa ({selectedStudents.size} dipilih)</Label>
                                {loadingStudents ? (
                                    <div className="py-4 text-center text-muted-foreground">
                                        Memuat daftar siswa...
                                    </div>
                                ) : classStudents.length > 0 ? (
                                    <div className="mt-2 space-y-2 border rounded-md p-3 max-h-[300px] overflow-y-auto">
                                        {classStudents.map(student => (
                                            <div
                                                key={student.id}
                                                className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex gap-2 flex-1">
                                                    {['present', 'late', 'absent'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => toggleStudentStatus(student.id, status)}
                                                            className={`flex-1 px-2 py-1 rounded text-sm font-medium transition-colors ${
                                                                selectedStudents.get(student.id) === status
                                                                    ? status === 'present'
                                                                        ? 'bg-green-500 text-white'
                                                                        : status === 'late'
                                                                            ? 'bg-yellow-500 text-white'
                                                                            : 'bg-red-500 text-white'
                                                                    : 'bg-muted text-muted-foreground hover:bg-muted'
                                                            }`}
                                                        >
                                                            {status === 'present' ? 'H' : status === 'late' ? 'T' : 'A'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <span className="text-sm flex-grow text-foreground">
                                                    {student.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-muted-foreground text-sm">
                                        Tidak ada siswa di kelas Anda
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleCloseManual}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={async () => {
                                    setManualProcessing(true);
                                    try {
                                        const students = Array.from(selectedStudents).map(([studentId, status]) => ({
                                            student_id: studentId,
                                            status,
                                        }));

                                        if (students.length === 0) {
                                            alert('Pilih minimal satu siswa');
                                            setManualProcessing(false);
                                            return;
                                        }

                                        const payload = {
                                            session_id: parseInt(manualSessionId, 10),
                                            phase: manualPhase,
                                            students,
                                        };

                                        const res = await fetch('/teacher/attendance/manual', {
                                            method: 'POST',
                                            credentials: 'same-origin',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'X-Requested-With': 'XMLHttpRequest',
                                                'Accept': 'application/json',
                                                ...(getCsrfToken() ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
                                            },
                                            body: JSON.stringify(payload),
                                        });

                                        if (!res.ok) {
                                            const data = await res.json();
                                            console.error('Manual save failed', data);
                                            alert(data.message || 'Penyimpanan absensi manual gagal. Periksa bahwa siswa yang dipilih berada di kelas Anda.');
                                        } else {
                                            handleCloseManual();
                                            window.location.reload();
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Kesalahan saat menyimpan absensi manual');
                                    } finally {
                                        setManualProcessing(false);
                                    }
                                }}
                                disabled={manualProcessing}
                            >
                                {manualProcessing ? 'Menyimpan...' : 'Simpan Absensi Manual'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'Absensi Harian',
            href: '#',
        },
    ],
};