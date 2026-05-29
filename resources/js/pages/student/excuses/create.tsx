import { Head, useForm } from '@inertiajs/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import student from '@/routes/student';

interface PendingAbsence {
    id: number;
    status: string;
    scanned_at: string;
    student: { name: string };
    session: { subject: string; type: string };
}

interface Props {
    pendingAbsences: PendingAbsence[];
}

export default function Create({ pendingAbsences }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'permission',
        reason: '',
        excused_date: '',
        attendance_record_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(student.excuses.store.url());
    };

    return (
        <>
            <Head title="Ajukan Izin" />

            <div className="mx-auto max-w-2xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Ajukan Izin
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Ajukan izin untuk ketidakhadiran Anda
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Ajuan Izin</CardTitle>
                        <CardDescription>
                            Isi formulir dengan informasi lengkap tentang alasan
                            ketidakhadiran Anda
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Selection */}
                            <div>
                                <Label htmlFor="type">Jenis Izin *</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) =>
                                        setData('type', value)
                                    }
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sick">
                                            Sakit
                                        </SelectItem>
                                        <SelectItem value="permission">
                                            Izin
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Lainnya
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            {/* Date Selection */}
                            <div>
                                <Label htmlFor="excused_date">
                                    Tanggal Ketidakhadiran *
                                </Label>
                                <Input
                                    id="excused_date"
                                    type="date"
                                    value={data.excused_date}
                                    onChange={(e) =>
                                        setData('excused_date', e.target.value)
                                    }
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.excused_date && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.excused_date}
                                    </p>
                                )}
                            </div>

                            {/* Pending Absences Info */}
                            {pendingAbsences.length > 0 && (
                                <Alert>
                                    <AlertDescription>
                                        <div className="text-sm">
                                            <p className="mb-2 font-medium">
                                                Riwayat Ketidakhadiran (Belum
                                                Diizinkan):
                                            </p>
                                            <ul className="list-inside list-disc space-y-1">
                                                {pendingAbsences.map(
                                                    (absence) => (
                                                        <li key={absence.id}>
                                                            {new Date(
                                                                absence.scanned_at,
                                                            ).toLocaleDateString(
                                                                'id-ID',
                                                            )}{' '}
                                                            -{' '}
                                                            {
                                                                absence.session
                                                                    .subject
                                                            }
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Reason */}
                            <div>
                                <Label htmlFor="reason">
                                    Alasan Ketidakhadiran *
                                </Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Jelaskan alasan Anda tidak bisa hadir..."
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                    rows={4}
                                    maxLength={500}
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {data.reason.length}/500 karakter
                                </p>
                                {errors.reason && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Mengirim...' : 'Ajukan Izin'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Alert>
                    <AlertDescription>
                        Ajuan Anda akan diproses oleh guru Anda. Anda akan
                        menerima notifikasi ketika ada keputusan.
                    </AlertDescription>
                </Alert>
            </div>
        </>
    );
}

Create.layout = {
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
            title: 'Ajukan Izin Baru',
            href: '#',
        },
    ],
};
