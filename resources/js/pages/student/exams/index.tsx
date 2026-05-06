import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ExamAttemptController from '@/actions/App/Http/Controllers/Student/ExamAttemptController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import student from '@/routes/student';

type ExamAttempt = {
    id: number;
    status: string;
    started_at: string | null;
    submitted_at: string | null;
};

type Exam = {
    id: number;
    title: string;
    subject: string | null;
    duration_minutes: number;
    starts_at: string | null;
    ends_at: string | null;
    status: string;
    attempt: ExamAttempt | null;
    can_start: boolean;
    has_access_code: boolean;
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

export default function StudentExamsIndex({ exams }: Props) {
    const [startingExamId, setStartingExamId] = useState<number | null>(null);

    function startExam(exam: Exam): void {
        let accessCode = '';

        if (exam.has_access_code) {
            const input = window.prompt('Masukkan kode akses ujian:');

            if (input === null) {
return;
} // User cancelled

            accessCode = input;
        }

        setStartingExamId(exam.id);

        router.post(ExamAttemptController.store.url({ exam: exam.id }), { access_code: accessCode }, {
            onFinish: () => {
                setStartingExamId(null);
            },
        });
    }

    function formatDateTime(value: string | null): string {
        if (!value) {
            return '-';
        }

        return new Date(value).toLocaleString('id-ID');
    }

    return (
        <>
            <Head title="Ujian Saya" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Ujian Saya</h1>
                    <p className="mt-2 text-muted-foreground">
                        Daftar ujian yang tersedia untuk kelas Anda.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ujian Aktif</CardTitle>
                        <CardDescription>
                            Total {exams.data.length} ujian dapat dikerjakan saat ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {exams.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada ujian aktif untuk kelas Anda.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {exams.data.map((exam) => {
                                    const attemptLabel = exam.attempt
                                        ? exam.attempt.status === 'in_progress'
                                            ? 'Sedang berlangsung'
                                            : 'Selesai'
                                        : 'Belum dimulai';

                                    return (
                                        <div key={exam.id} className="rounded-lg border border-border p-4">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Mata pelajaran</p>
                                                        <p className="font-medium text-foreground">
                                                            {exam.subject ?? '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Judul ujian</p>
                                                        <p className="font-semibold text-foreground">{exam.title}</p>
                                                    </div>
                                                    <div className="grid gap-1 text-sm text-muted-foreground">
                                                        <p>Durasi: {exam.duration_minutes} menit</p>
                                                        <p>Mulai: {formatDateTime(exam.starts_at)}</p>
                                                        <p>Selesai: {formatDateTime(exam.ends_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3">
                                                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                                        {attemptLabel}
                                                    </span>
                                                    {exam.can_start ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => startExam(exam)}
                                                            disabled={startingExamId === exam.id}
                                                        >
                                                            {startingExamId === exam.id ? 'Memulai...' : 'Mulai Ujian'}
                                                        </Button>
                                                    ) : (
                                                        <Button type="button" size="sm" variant="secondary" disabled>
                                                            Ujian sudah dimulai
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                Halaman {exams.current_page} dari {exams.last_page}
                            </span>
                            <div className="flex gap-3">
                                {exams.prev_page_url && (
                                    <Link
                                        href={exams.prev_page_url}
                                        className="text-primary hover:underline"
                                    >
                                        Sebelumnya
                                    </Link>
                                )}
                                {exams.next_page_url && (
                                    <Link
                                        href={exams.next_page_url}
                                        className="text-primary hover:underline"
                                    >
                                        Berikutnya
                                    </Link>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StudentExamsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Siswa',
            href: dashboard(),
        },
        {
            title: 'Ujian Saya',
            href: student.exams.index.url(),
        },
    ],
};
