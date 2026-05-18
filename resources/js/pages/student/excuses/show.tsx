import { Head } from '@inertiajs/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    student: { name: string };
    submittedBy: { name: string };
    reviewedBy?: { name: string };
}

interface Props {
    excuse: Excuse;
}

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (status) {
        case 'approved':
            return 'default';
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

export default function Show({ excuse }: Props) {
    return (
        <>
            <Head title="Detail Ajuan Izin" />

            <div className="space-y-6 p-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Detail Ajuan Izin</h1>
                        <p className="mt-2 text-muted-foreground">ID Ajuan: #{excuse.id}</p>
                    </div>
                    <Badge variant={getStatusVariant(excuse.status)}>
                        {excuse.status === 'pending' ? 'Menunggu' :
                            excuse.status === 'approved' ? 'Disetujui' :
                                'Ditolak'}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Main Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Jenis Izin</p>
                                <p className="font-medium">{getTypeLabel(excuse.type)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tanggal Ketidakhadiran</p>
                                <p className="font-medium">
                                    {new Date(excuse.excused_date).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Diajukan Pada</p>
                                <p className="font-medium">
                                    {new Date(excuse.created_at).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Diajukan Oleh</p>
                                <p className="font-medium">{excuse.submittedBy.name}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Pengajuan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-medium">
                                    {excuse.status === 'pending' ? 'Menunggu Persetujuan' :
                                        excuse.status === 'approved' ? 'Disetujui' :
                                            'Ditolak'}
                                </p>
                            </div>
                            {excuse.reviewedBy && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Diproses Oleh</p>
                                    <p className="font-medium">{excuse.reviewedBy.name}</p>
                                </div>
                            )}
                            {excuse.review_notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Catatan</p>
                                    <p className="font-medium text-sm bg-muted p-2 rounded">
                                        {excuse.review_notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Reason */}
                <Card>
                    <CardHeader>
                        <CardTitle>Alasan Ketidakhadiran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground whitespace-pre-wrap">
                            {excuse.reason}
                        </p>
                    </CardContent>
                </Card>

                {/* Status Message */}
                {excuse.status === 'pending' && (
                    <Alert>
                        <AlertDescription>
                            Ajuan Anda sedang diproses oleh guru Anda. Harap menunggu keputusan.
                        </AlertDescription>
                    </Alert>
                )}

                {excuse.status === 'approved' && (
                    <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">
                            Ajuan Anda telah disetujui. Ketidakhadiran Anda telah dicatat sebagai izin.
                        </AlertDescription>
                    </Alert>
                )}

                {excuse.status === 'rejected' && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                            Ajuan Anda telah ditolak. Silakan hubungi guru Anda untuk keterangan lebih lanjut.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Action Button */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Kembali
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                    >
                        Cetak
                    </Button>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Siswa',
            href: dashboard(),
        },
        {
            title: 'Ajuan Izin',
            href: student.excuses.index(),
        },
        {
            title: 'Detail Ajuan',
            href: '#',
        },
    ],
};
