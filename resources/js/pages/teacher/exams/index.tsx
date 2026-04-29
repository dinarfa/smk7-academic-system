import { Head, Link } from '@inertiajs/react';
import ExamController from '@/actions/App/Http/Controllers/Teacher/ExamController';
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
                        <h1 className="text-3xl font-bold text-gray-900">
                            Daftar Ujian
                        </h1>
                        <p className="mt-2 text-gray-600">
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
                                                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                                    {exam.status}
                                                </span>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {exam.created_at}
                                                </p>
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
