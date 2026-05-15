import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { dashboard } from '@/routes';
import teacher from '@/routes/teacher';

interface Excuse {
    id: number;
    type: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    excused_date: string;
    created_at: string;
    reviewed_by?: number;
    review_notes?: string;
    student: { name: string; id: number };
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
    const { data, setData, patch, processing } = useForm({
        review_notes: excuse.review_notes || '',
    });

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        patch(teacher.excuses.approve.url(excuse.id));
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        patch(teacher.excuses.reject.url(excuse.id));
    };

    return (
        <>
            <Head title="Review Ajuan Izin" />

            <div className="space-y-6 p-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Review Ajuan Izin</h1>
                        <p className="mt-2 text-muted-foreground">ID Ajuan: #{excuse.id}</p>
                    </div>
                    <Badge variant={getStatusVariant(excuse.status)}>
                        {excuse.status === 'pending' ? 'Menunggu' :
                         excuse.status === 'approved' ? 'Disetujui' :
                         'Ditolak'}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Student Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Siswa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{excuse.student.name}</p>
                        </CardContent>
                    </Card>

                    {/* Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Jenis Izin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="outline">
                                {getTypeLabel(excuse.type)}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Date */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tanggal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">
                                {new Date(excuse.excused_date).toLocaleDateString('id-ID')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reason */}
                <Card>
                    <CardHeader>
                        <CardTitle>Alasan Ketidakhadiran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground whitespace-pre-wrap bg-muted p-3 rounded">
                            {excuse.reason}
                        </p>
                    </CardContent>
                </Card>

                {/* Submission Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Pengajuan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Diajukan Oleh</p>
                            <p className="font-medium">{excuse.submittedBy.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tanggal Pengajuan</p>
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
                    </CardContent>
                </Card>

                {/* Review Section - only if pending */}
                {excuse.status === 'pending' && (
                    <>
                        <Alert>
                            <AlertDescription>
                                Silakan review ajuan ini dan memberikan keputusan. Masukkan catatan jika diperlukan.
                            </AlertDescription>
                        </Alert>

                        <Card>
                            <CardHeader>
                                <CardTitle>Catatan Review</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="review_notes">Catatan (Opsional)</Label>
                                    <Textarea
                                        id="review_notes"
                                        placeholder="Tambahkan catatan atau alasan keputusan Anda..."
                                        value={data.review_notes}
                                        onChange={(e) => setData('review_notes', e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleApprove}
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {processing ? 'Memproses...' : 'Setujui'}
                                    </Button>
                                    <Button
                                        onClick={handleReject}
                                        disabled={processing}
                                        variant="destructive"
                                    >
                                        {processing ? 'Memproses...' : 'Tolak'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Review Result - if already reviewed */}
                {excuse.status !== 'pending' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Hasil Review</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-medium">
                                    {excuse.status === 'approved' ? 'Disetujui' : 'Ditolak'}
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
                                    <p className="text-foreground whitespace-pre-wrap bg-muted p-3 rounded">
                                        {excuse.review_notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                >
                    Kembali
                </Button>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'Manajemen Ajuan Izin',
            href: teacher.excuses.index(),
        },
        {
            title: 'Review Ajuan',
            href: '#',
        },
    ],
};
