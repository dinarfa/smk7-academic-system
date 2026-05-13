import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboard } from '@/routes';
import student from '@/routes/student';

interface Excuse {
    id: number;
    type: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    excused_date: string;
    created_at: string;
    reviewed_by?: number;
    review_notes?: string;
}

interface Props {
    excuses: {
        data: Excuse[];
        links: any;
    };
}

const getStatusVariant = (status: string): 'default' | 'success' | 'destructive' | 'outline' | 'secondary' => {
    switch (status) {
        case 'approved':
            return 'success';
        case 'rejected':
            return 'destructive';
        case 'pending':
            return 'secondary';
        default:
            return 'outline';
    }
};

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

export default function Index({ excuses }: Props) {
    return (
        <>
            <Head title="Ajuan Izin" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Ajuan Izin</h1>
                        <p className="mt-2 text-muted-foreground">Kelola ajuan izin dan ketidakhadiran Anda</p>
                    </div>
                    <Link href={student.excuses.create()}>
                        <Button>Ajukan Izin Baru</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Ajuan Izin</CardTitle>
                        <CardDescription>
                            Daftar semua ajuan izin Anda
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {excuses.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Alasan</TableHead>
                                        <TableHead>Diajukan</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {excuses.data.map((excuse) => (
                                        <TableRow key={excuse.id}>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getTypeLabel(excuse.type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {new Date(excuse.excused_date).toLocaleDateString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(excuse.status)}>
                                                    {excuse.status === 'pending' ? 'Menunggu' :
                                                     excuse.status === 'approved' ? 'Disetujui' :
                                                     'Ditolak'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground line-clamp-2">
                                                {excuse.reason}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(excuse.created_at).toLocaleDateString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <Link href={student.excuses.show(excuse.id)}>
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
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Belum ada ajuan izin</p>
                                <Link href={student.excuses.create()}>
                                    <Button variant="outline" className="mt-4">
                                        Ajukan Izin Pertama
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Siswa',
            href: dashboard(),
        },
        {
            title: 'Ajuan Izin',
            href: '#',
        },
    ],
};
