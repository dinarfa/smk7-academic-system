import { Head, Link, router } from '@inertiajs/react';
import ExamController from '@/actions/App/Http/Controllers/Teacher/ExamController';
import QuestionController from '@/actions/App/Http/Controllers/Teacher/QuestionController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

type Exam = {
    id: number;
    title: string;
    subject: string | null;
    class: string | null;
    duration_minutes: number;
    status: string;
    created_at: string | null;
};

type Props = {
    exams: {
        data: Exam[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
};

export default function TeacherExamsIndex({ exams }: Props) {
    return (
        <>
            <Head title="Daftar Ujian" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">
                            Daftar Ujian
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola ujian yang Anda buat.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={ExamController.create.url()}>
                            Buat Ujian Baru
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ujian Anda</CardTitle>
                        <CardDescription>
                            Total {exams.data.length} ujian
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {exams.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada ujian. Buat ujian baru untuk memulai.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {exams.data.map((exam) => (
                                    <div
                                        key={exam.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium">
                                                    {exam.title}
                                                </h3>
                                                <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                                                    <p>
                                                        Mata Pelajaran:{' '}
                                                        {exam.subject ?? '-'}
                                                    </p>
                                                    <p>
                                                        Kelas: {exam.class ?? '-'}
                                                    </p>
                                                    <p>
                                                        Durasi:{' '}
                                                        {exam.duration_minutes}{' '}
                                                        menit
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <span className={exam.status !== 'draft' ? 'inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'inline-block rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground'}>
                                                        {exam.status !== 'draft' ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {exam.created_at}
                                                </p>
                                                <div className="mt-3 flex flex-col gap-2">
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={QuestionController.index.url({ exam: exam.id })}>
                                                            Kelola Soal
                                                        </Link>
                                                    </Button>
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={ExamController.results.url({ exam: exam.id })}>
                                                            Lihat Hasil
                                                        </Link>
                                                    </Button>
                                                    <Button asChild size="sm">
                                                        <Link href={QuestionController.create.url({ exam: exam.id })}>
                                                            Tambah Soal
                                                        </Link>
                                                    </Button>
                                                    {exam.status !== 'draft' ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => router.patch(ExamController.unpublish.url({ exam: exam.id }))}
                                                        >
                                                            Tutup Ujian
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => router.patch(ExamController.publish.url({ exam: exam.id }))}
                                                        >
                                                            Buka Ujian
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TeacherExamsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'Ujian',
            href: ExamController.index.url(),
        },
    ],
};
