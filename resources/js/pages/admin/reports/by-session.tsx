import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Search } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import admin from '@/routes/admin';

type AttendanceRecord = {
    id: number;
    student_name: string;
    student_email: string;
    status: string;
    scanned_at: string;
};

type Session = {
    id: number;
    subject: string;
    type: string;
    opened_by: string;
    created_at: string;
    records_count: number;
    is_active: boolean;
    records: AttendanceRecord[];
};

type SchoolClass = { id: number; name: string };

type Props = {
    sessions: {
        data: Session[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    classes?: SchoolClass[];
    filters?: {
        class_id?: number | null;
        search?: string;
        start_date?: string;
        end_date?: string;
    };
};

export default function AdminReportsBySession({
    sessions,
    classes,
    filters,
}: Props) {
    const [classId, setClassId] = useState(
        filters?.class_id ? String(filters.class_id) : '',
    );
    const [search, setSearch] = useState(filters?.search ?? '');
    const [startDate, setStartDate] = useState(filters?.start_date ?? '');
    const [endDate, setEndDate] = useState(filters?.end_date ?? '');

    function handleFilter() {
        const params: Record<string, string> = {};

        if (classId && classId !== 'all') {
            params.class_id = classId;
        }

        if (search) {
            params.search = search;
        }

        if (startDate) {
            params.start_date = startDate;
        }

        if (endDate) {
            params.end_date = endDate;
        }

        router.get(admin.reports.bySession.url(), params, {
            preserveState: true,
        });
    }

    return (
        <>
            <Head title="Kehadiran Per Sesi" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Kehadiran Per Sesi
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lihat catatan kehadiran berdasarkan kelas/sesi
                        </p>
                    </div>
                    <Button asChild variant="secondary" size="sm">
                        <Link href={admin.reports.overview.url()}>Kembali</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
                    {classes && classes.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                                Kelas
                            </label>
                            <Select value={classId} onValueChange={setClassId}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Semua Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Kelas
                                    </SelectItem>
                                    {classes.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Cari
                        </label>
                        <Input
                            placeholder="Cari sesi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-56"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Dari Tanggal
                        </label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-40"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Sampai Tanggal
                        </label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-40"
                        />
                    </div>
                    <Button onClick={handleFilter} size="sm">
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                {sessions.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ClipboardList className="h-10 w-10 text-muted-foreground/50" />
                        <h3 className="mt-4 text-sm font-medium text-foreground">
                            Belum Ada Sesi
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Data sesi kehadiran akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.data.map((session) => (
                            <Card key={session.id}>
                                <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>{session.subject}</CardTitle>
                                        <CardDescription>
                                            Tipe: {session.type} · Dibuka oleh:{' '}
                                            {session.opened_by}
                                        </CardDescription>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(
                                                session.created_at,
                                            ).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-semibold text-foreground">
                                            {session.records_count}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            peserta
                                        </p>
                                        <StatusBadge
                                            className="mt-2"
                                            status={
                                                session.is_active
                                                    ? 'active'
                                                    : 'draft'
                                            }
                                            label={
                                                session.is_active
                                                    ? 'Aktif'
                                                    : 'Ditutup'
                                            }
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="border-t border-border pt-4">
                                        <h4 className="text-sm font-semibold text-foreground">
                                            Catatan Kehadiran
                                        </h4>
                                        <div className="mt-3 overflow-x-auto">
                                            <table className="min-w-full divide-y divide-border">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                                        >
                                                            Siswa
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                                        >
                                                            Email
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                                        >
                                                            Status
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                                        >
                                                            Waktu Scan
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {session.records.length ===
                                                    0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan={4}
                                                                className="px-4 py-3 text-center text-sm text-muted-foreground"
                                                            >
                                                                Belum ada
                                                                catatan
                                                                kehadiran
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        session.records.map(
                                                            (record) => (
                                                                <tr
                                                                    key={
                                                                        record.id
                                                                    }
                                                                    className="hover:bg-muted/40"
                                                                >
                                                                    <td className="px-4 py-2 text-sm font-medium text-foreground">
                                                                        {
                                                                            record.student_name
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                        {
                                                                            record.student_email
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm">
                                                                        <StatusBadge
                                                                            status={
                                                                                record.status
                                                                            }
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                        {new Date(
                                                                            record.scanned_at,
                                                                        ).toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Card>
                    <CardContent className="flex items-center justify-between py-4">
                        <div className="flex flex-1 justify-between sm:hidden">
                            {sessions.prev_page_url && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={sessions.prev_page_url}>
                                        Sebelumnya
                                    </Link>
                                </Button>
                            )}
                            {sessions.next_page_url && (
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="ml-3"
                                >
                                    <Link href={sessions.next_page_url}>
                                        Selanjutnya
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Halaman{' '}
                                <span className="font-medium text-foreground">
                                    {sessions.current_page}
                                </span>{' '}
                                dari{' '}
                                <span className="font-medium text-foreground">
                                    {sessions.last_page}
                                </span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminReportsBySession.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Ringkasan Laporan', href: admin.reports.overview.url() },
        { title: 'Per Sesi', href: admin.reports.bySession.url() },
    ],
};
