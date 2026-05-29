import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import admin from '@/routes/admin';

type SchoolClass = { id: number; name: string };

type Session = {
    id: number;
    subject: string;
    type: string;
    opened_by: string;
    created_at: string;
    is_active: boolean;
    total: number;
    present: number;
    absent: number;
    excused: number;
};

type Summary = {
    total_sessions: number;
    total_records: number;
    present: number;
    absent: number;
    excused: number;
};

type Props = {
    classes: SchoolClass[];
    sessions: Session[];
    summary: Summary;
    filters: {
        class_id: number | null;
        start_date: string | null;
        end_date: string | null;
    };
};

export default function AdminReportsByClass({
    classes,
    sessions,
    summary,
    filters,
}: Props) {
    const [classId, setClassId] = useState<string>(
        filters.class_id ? String(filters.class_id) : '',
    );
    const [startDate, setStartDate] = useState(filters.start_date ?? '');
    const [endDate, setEndDate] = useState(filters.end_date ?? '');

    function handleFilter() {
        const params: Record<string, string> = {};

        if (classId) {
            params.class_id = classId;
        }

        if (startDate) {
            params.start_date = startDate;
        }

        if (endDate) {
            params.end_date = endDate;
        }

        router.get(admin.reports.byClass.url(), params, {
            preserveState: true,
        });
    }

    return (
        <>
            <Head title="Rekap Absensi Per Kelas" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Rekap Absensi Per Kelas
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lihat ringkasan kehadiran siswa per kelas dalam
                            rentang waktu tertentu.
                        </p>
                    </div>
                    <Button asChild variant="secondary" size="sm">
                        <Link href={admin.reports.overview.url()}>Kembali</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                        <CardDescription>
                            Pilih kelas dan rentang tanggal untuk melihat rekap.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label>Kelas</Label>
                                <Select
                                    value={classId}
                                    onValueChange={setClassId}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                            <div className="space-y-2">
                                <Label>Dari Tanggal</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sampai Tanggal</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleFilter} disabled={!classId}>
                                Tampilkan
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {classId && (
                    <div className="grid gap-4 sm:grid-cols-5">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">
                                    Total Sesi
                                </p>
                                <p className="text-2xl font-bold">
                                    {summary.total_sessions}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">
                                    Total Record
                                </p>
                                <p className="text-2xl font-bold">
                                    {summary.total_records}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">
                                    Hadir
                                </p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {summary.present}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">
                                    Tidak Hadir
                                </p>
                                <p className="text-2xl font-bold text-rose-600">
                                    {summary.absent}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">
                                    Izin/Sakit
                                </p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {summary.excused}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {classId && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Sesi Absensi</CardTitle>
                            <CardDescription>
                                {sessions.length} sesi ditemukan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {sessions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Tidak ada sesi absensi untuk filter ini.
                                </p>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between rounded-lg border border-border p-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground">
                                                    {session.subject ??
                                                        session.type}
                                                </span>
                                                <Badge
                                                    className={
                                                        session.is_active
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-muted text-muted-foreground'
                                                    }
                                                >
                                                    {session.is_active
                                                        ? 'Aktif'
                                                        : 'Selesai'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Dibuka oleh {session.opened_by}{' '}
                                                ·{' '}
                                                {new Date(
                                                    session.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="font-bold text-emerald-600">
                                                    {session.present}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Hadir
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-rose-600">
                                                    {session.absent}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Absen
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-amber-600">
                                                    {session.excused}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Izin
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold">
                                                    {session.total}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Total
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

AdminReportsByClass.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Ringkasan Laporan', href: admin.reports.overview.url() },
        { title: 'Per Kelas', href: admin.reports.byClass.url() },
    ],
};
