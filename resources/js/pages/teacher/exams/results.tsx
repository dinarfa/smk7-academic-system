import { Head, Link } from '@inertiajs/react';
import ExamController from '@/actions/App/Http/Controllers/Teacher/ExamController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboard } from '@/routes';
import teacher from '@/routes/teacher';

type Attempt = {
    id: number;
    student_name: string;
    status: string;
    score: number;
    started_at: string | null;
    submitted_at: string | null;
};

type Props = {
    exam: {
        id: number;
        title: string;
    };
    attempts: Attempt[];
};

function formatDateTime(value: string | null): string {
    if (!value) {
        return '-';
    }
    return new Date(value).toLocaleString('id-ID');
}

export default function TeacherExamResults({ exam, attempts }: Props) {
    function exportResults() {
        window.location.href = ExamController.export.url({ exam: exam.id });
    }

    return (
        <>
            <Head title={`Hasil Ujian: ${exam.title}`} />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Hasil Ujian</h1>
                        <p className="mt-2 text-muted-foreground">{exam.title}</p>
                    </div>

                    <div className="flex gap-2">
                        <Button type="button" onClick={exportResults}>
                            Export CSV
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={teacher.exams.index.url()}>Kembali</Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Hasil Siswa</CardTitle>
                        <CardDescription>
                            Terdapat {attempts.length} data pengerjaan ujian.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {attempts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada siswa yang mengerjakan ujian ini.</p>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 text-center">No</TableHead>
                                            <TableHead>Nama Siswa</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Mulai</TableHead>
                                            <TableHead>Selesai</TableHead>
                                            <TableHead className="text-right">Nilai</TableHead>
                                            <TableHead className="text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attempts.map((attempt, index) => (
                                            <TableRow key={attempt.id}>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{attempt.student_name ?? 'Siswa tidak ditemukan'}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${attempt.status === 'completed' || attempt.status === 'submitted' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500'}`}>
                                                        {attempt.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{formatDateTime(attempt.started_at)}</TableCell>
                                                <TableCell className="text-muted-foreground">{formatDateTime(attempt.submitted_at)}</TableCell>
                                                <TableCell className="text-right font-bold">{attempt.score ?? 0}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={teacher.exams.attempts.correction.url({ exam: exam.id, attempt: attempt.id })}>
                                                            Koreksi
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TeacherExamResults.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'Kelola Ujian',
            href: teacher.exams.index.url(),
        },
        {
            title: 'Hasil Ujian',
            href: '',
        },
    ],
};
