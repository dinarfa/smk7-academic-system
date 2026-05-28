import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboard } from '@/routes';
import teacher from '@/routes/teacher';

interface Excuse {
    id: number;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    excused_date: string;
    created_at: string;
    student: { name: string };
    submittedBy: { name: string };
}

interface Props {
    excuses: {
        data: Excuse[];
        links: any;
    };
}

interface ExcuseTableProps {
    data: Excuse[];
}

const getTypeLabel = (type: string): string => {
    switch (type) {
        case 'sick':
            return 'Sakit';
        case 'permission':
            return 'Izin';
        case 'other':
            return 'Lainnya';
        default:
            return type;
    }
};

function ExcuseTable({ data }: ExcuseTableProps) {
    return data.length > 0 ? (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Diajukan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((excuse) => (
                    <TableRow key={excuse.id}>
                        <TableCell className="font-medium">
                            {excuse.student.name}
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">
                                {getTypeLabel(excuse.type)}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {new Date(excuse.excused_date).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {new Date(excuse.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                            <StatusBadge status={excuse.status} />
                        </TableCell>
                        <TableCell>
                            <Link href={teacher.excuses.show(excuse.id)}>
                                <Button variant="ghost" size="sm">
                                    Lihat
                                </Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 text-sm font-medium text-foreground">Tidak Ada Ajuan Izin</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Belum ada ajuan izin pada kategori ini.
            </p>
        </div>
    );
}

export default function Index({ excuses }: Props) {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const allExcuses = excuses.data;
    const pendingExcuses = allExcuses.filter(e => e.status === 'pending');
    const approvedExcuses = allExcuses.filter(e => e.status === 'approved');
    const rejectedExcuses = allExcuses.filter(e => e.status === 'rejected');

    return (
        <>
            <Head title="Manajemen Ajuan Izin" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Manajemen Ajuan Izin</h1>
                    <p className="mt-2 text-muted-foreground">Kelola ajuan izin dari siswa-siswa Anda</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingExcuses.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Disetujui</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{approvedExcuses.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ditolak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{rejectedExcuses.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for different statuses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ajuan Izin</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                            {/* Tab Buttons */}
                            <div className="flex gap-2 border-b">
                                <Button
                                    variant={activeTab === 'pending' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('pending')}
                                    className="rounded-b-none"
                                >
                                    Menunggu ({pendingExcuses.length})
                                </Button>
                                <Button
                                    variant={activeTab === 'approved' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('approved')}
                                    className="rounded-b-none"
                                >
                                    Disetujui ({approvedExcuses.length})
                                </Button>
                                <Button
                                    variant={activeTab === 'rejected' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('rejected')}
                                    className="rounded-b-none"
                                >
                                    Ditolak ({rejectedExcuses.length})
                                </Button>
                            </div>

                            {/* Tab Content */}
                            <div className="mt-4">
                                {activeTab === 'pending' && <ExcuseTable data={pendingExcuses} />}
                                {activeTab === 'approved' && <ExcuseTable data={approvedExcuses} />}
                                {activeTab === 'rejected' && <ExcuseTable data={rejectedExcuses} />}
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
            title: 'Manajemen Ajuan Izin',
            href: '#',
        },
    ],
};
