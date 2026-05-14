import { Head } from '@inertiajs/react';
import AttendanceController from '@/actions/App/Http/Controllers/Student/AttendanceController';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { ClipboardList, CheckCircle2, Clock, XCircle, ShieldQuestion } from 'lucide-react';

type AttendanceRecord = {
    id: number;
    status: string;
    scanned_at: string | null;
    session: {
        type: string | null;
        subject: string | null;
        starts_at: string | null;
        ends_at: string | null;
    };
};

type Props = {
    records: {
        data: AttendanceRecord[];
    };
};

export default function StudentAttendance({ records }: Props) {
    return (
        <>
            <Head title="Kehadiran Saya" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Kehadiran Saya</h1>
                    <p className="text-muted-foreground">Riwayat kehadiran Anda.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            Riwayat Kehadiran
                        </CardTitle>
                        <CardDescription>Daftar kehadiran yang sudah tercatat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2 pr-3">Jenis</th>
                                        <th className="py-2 pr-3">Mapel</th>
                                        <th className="py-2 pr-3">Status</th>
                                        <th className="py-2">Waktu Scan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.data.length === 0 && (
                                        <tr>
                                            <td
                                                className="py-4 text-muted-foreground"
                                                colSpan={4}
                                            >
                                                Belum ada kehadiran yang tercatat.
                                            </td>
                                        </tr>
                                    )}

                                    {records.data.map((record) => (
                                        <tr key={record.id} className="border-b">
                                            <td className="py-2 pr-3">{record.session.type ?? '-'}</td>
                                            <td className="py-2 pr-3">{record.session.subject ?? '-'}</td>
                                            <td className="py-2 pr-3">{record.status}</td>
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

StudentAttendance.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Siswa',
            href: dashboard(),
        },
        {
            title: 'Kehadiran Saya',
            href: AttendanceController.index(),
        },
    ],
};
