import { Head } from '@inertiajs/react';
import AttendanceController from '@/actions/App/Http/Controllers/Student/AttendanceController';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

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
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Kehadiran</CardTitle>
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
