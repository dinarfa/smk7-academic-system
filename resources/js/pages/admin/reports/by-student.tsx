import { Head, Link, router } from '@inertiajs/react';
import { Users, Search } from 'lucide-react';
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
import admin from '@/routes/admin';

type StudentRecord = {
    id: number;
    session_subject: string;
    session_type: string;
    status: string;
    scanned_at: string;
};

type Student = {
    id: number;
    name: string;
    email: string;
    records_count: number;
    records: StudentRecord[];
};

type Props = {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters?: {
        search?: string;
    };
};

export default function AdminReportsByStudent({ students, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');

    function handleSearch() {
        const params: Record<string, string> = {};

        if (search) {
            params.search = search;
        }

        router.get(admin.reports.byStudent.url(), params, {
            preserveState: true,
        });
    }

    return (
        <>
            <Head title="Kehadiran Per Siswa" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Kehadiran Per Siswa
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lihat riwayat kehadiran setiap siswa
                        </p>
                    </div>
                    <Button asChild variant="secondary" size="sm">
                        <Link href={admin.reports.overview.url()}>Kembali</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Cari Siswa
                        </label>
                        <Input
                            placeholder="Nama atau email siswa..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64"
                        />
                    </div>
                    <Button onClick={handleSearch} size="sm">
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                {students.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="h-10 w-10 text-muted-foreground/50" />
                        <h3 className="mt-4 text-sm font-medium text-foreground">
                            Belum Ada Data Siswa
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Data kehadiran per siswa akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {students.data.map((student) => (
                            <Card key={student.id}>
                                <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>{student.name}</CardTitle>
                                        <CardDescription>
                                            {student.email}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-semibold text-foreground">
                                            {student.records_count}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            total catatan
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="border-t border-border pt-4">
                                        <h4 className="text-sm font-semibold text-foreground">
                                            Riwayat Kehadiran
                                        </h4>
                                        <div className="mt-3 overflow-x-auto">
                                            <table className="min-w-full divide-y divide-border">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                                        >
                                                            Sesi
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                                        >
                                                            Tipe
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground"
                                                        >
                                                            Mapel
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
                                                            Waktu
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {student.records.length ===
                                                    0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan={5}
                                                                className="px-4 py-3 text-center text-sm text-muted-foreground"
                                                            >
                                                                Belum ada
                                                                catatan
                                                                kehadiran
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        student.records.map(
                                                            (record) => (
                                                                <tr
                                                                    key={
                                                                        record.id
                                                                    }
                                                                    className="hover:bg-muted/40"
                                                                >
                                                                    <td className="px-4 py-2 text-sm font-medium text-foreground">
                                                                        {
                                                                            record.session_subject
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                        {
                                                                            record.session_type
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                        {
                                                                            record.session_subject
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
                            {students.prev_page_url && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={students.prev_page_url}>
                                        Sebelumnya
                                    </Link>
                                </Button>
                            )}
                            {students.next_page_url && (
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="ml-3"
                                >
                                    <Link href={students.next_page_url}>
                                        Selanjutnya
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Halaman{' '}
                                <span className="font-medium text-foreground">
                                    {students.current_page}
                                </span>{' '}
                                dari{' '}
                                <span className="font-medium text-foreground">
                                    {students.last_page}
                                </span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminReportsByStudent.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Ringkasan Laporan', href: admin.reports.overview.url() },
        { title: 'Per Siswa', href: admin.reports.byStudent.url() },
    ],
};
