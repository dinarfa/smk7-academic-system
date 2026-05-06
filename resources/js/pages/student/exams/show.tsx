import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent} from 'react';
import { useEffect, useState, useCallback } from 'react';
import ExamResponseController from '@/actions/App/Http/Controllers/Student/ExamResponseController';
import ExamSubmissionController from '@/actions/App/Http/Controllers/Student/ExamSubmissionController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import student from '@/routes/student';

type AnswerOption = {
    id: number;
    option_text: string;
    sort_order: number;
};

type Question = {
    id: number;
    prompt: string;
    type: string;
    points: number;
    sort_order: number;
    answer_options: AnswerOption[];
    response: {
        answer_option_id: number | null;
        response_text: string | null;
    } | null;
};

type Props = {
    exam: {
        id: number;
        title: string;
        subject: string | null;
        duration_minutes: number;
        starts_at: string | null;
        ends_at: string | null;
        status: string;
    };
    attempt: {
        id: number;
        status: string;
        started_at: string | null;
    };
    questions: Question[];
};

function formatDateTime(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString('id-ID');
}

function QuestionCard({ examId, attemptId, question }: { examId: number; attemptId: number; question: Question }) {
    const selectedAnswerId = question.response?.answer_option_id?.toString() ?? '';

    function saveChoice(answerOptionId: number): void {
        router.post(
            ExamResponseController.store.url({ exam: examId, attempt: attemptId }),
            {
                question_id: question.id,
                answer_option_id: answerOptionId,
                response_text: null,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    function saveText(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const responseText = String(formData.get('response_text') ?? '').trim();

        router.post(
            ExamResponseController.store.url({ exam: examId, attempt: attemptId }),
            {
                question_id: question.id,
                answer_option_id: null,
                response_text: responseText,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardDescription>Poin {question.points}</CardDescription>
                <div 
                    className="text-lg leading-7 font-medium prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: question.prompt }} 
                />
            </CardHeader>
            <CardContent className="space-y-4">
                {(question.type === 'multiple_choice' || question.type === 'objective') && question.answer_options.length > 0 ? (
                    <div className="space-y-3">
                        {question.answer_options.map((option) => (
                            <label
                                key={option.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${selectedAnswerId === option.id.toString() ? 'border-primary bg-primary/5' : 'border-border'}`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    checked={selectedAnswerId === option.id.toString()}
                                    onChange={() => saveChoice(option.id)}
                                    className="mt-1"
                                />
                                <div 
                                    className="prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: option.option_text }}
                                />
                            </label>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={saveText} className="space-y-3">
                        <Textarea
                            name="response_text"
                            defaultValue={question.response?.response_text ?? ''}
                            placeholder="Tulis jawaban Anda di sini"
                            rows={5}
                        />
                        <Button type="submit" size="sm">
                            Simpan Jawaban
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}

export default function StudentExamShow({ exam, attempt, questions }: Props) {
    const [timeLeft, setTimeLeft] = useState<number>(() => {
        if (!attempt.started_at || attempt.status !== 'in_progress') {
return 0;
}

        const started = new Date(attempt.started_at).getTime();
        const durationMs = exam.duration_minutes * 60 * 1000;
        const endTime = started + durationMs;
        const now = new Date().getTime();

        return Math.max(0, endTime - now);
    });

    const submitExam = useCallback(() => {
        router.post(ExamSubmissionController.store.url({ exam: exam.id, attempt: attempt.id }), {});
    }, [exam.id, attempt.id]);

    useEffect(() => {
        if (!attempt.started_at || attempt.status !== 'in_progress') {
return;
}

        const started = new Date(attempt.started_at).getTime();
        const durationMs = exam.duration_minutes * 60 * 1000;
        const endTime = started + durationMs;

        const calculateRemaining = () => {
            const now = new Date().getTime();

            return Math.max(0, endTime - now);
        };

        const interval = setInterval(() => {
            const remaining = calculateRemaining();
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                submitExam();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [attempt.started_at, attempt.status, exam.duration_minutes, submitExam]);

    function formatTimeLeft(ms: number) {
        if (ms <= 0) {
return '00:00:00';
}

        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [hours, minutes, seconds]
            .map(v => v < 10 ? '0' + v : v)
            .join(':');
    }



    return (
        <>
            <Head title={exam.title} />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">{exam.title}</h1>
                        <p className="mt-2 text-muted-foreground">
                            {exam.subject ?? '-'} · Durasi {exam.duration_minutes} menit
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Mulai: {formatDateTime(exam.starts_at)} · Selesai: {formatDateTime(exam.ends_at)}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {attempt.status === 'in_progress' && (
                            <div className="rounded-md bg-red-500/10 px-4 py-2 text-center text-red-600 dark:text-red-400">
                                <p className="text-xs font-semibold uppercase tracking-wider">Sisa Waktu</p>
                                <p className="text-xl font-bold tabular-nums leading-none">
                                    {formatTimeLeft(timeLeft)}
                                </p>
                            </div>
                        )}
                        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                            Attempt #{attempt.id}
                        </span>
                        {attempt.status === 'in_progress' && (
                            <Button type="button" variant="destructive" onClick={submitExam}>
                                Kumpulkan Ujian
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Instruksi Pengerjaan</CardTitle>
                        <CardDescription>
                            Simpan jawaban setiap soal sebelum mengumpulkan ujian.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                        <p>Status attempt: {attempt.status}</p>
                        <p>Waktu mulai: {formatDateTime(attempt.started_at)}</p>
                        <p>Total soal: {questions.length}</p>
                    </CardContent>
                </Card>

                {questions.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            Belum ada soal yang ditambahkan untuk ujian ini.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question, index) => (
                            <div key={question.id} className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Soal {index + 1}
                                </div>
                                <QuestionCard examId={exam.id} attemptId={attempt.id} question={question} />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <Link href={student.exams.index.url()} className="text-sm text-primary hover:underline">
                        Kembali ke daftar ujian
                    </Link>
                    <Link href={dashboard()} className="text-sm text-muted-foreground hover:underline">
                        Dashboard
                    </Link>
                </div>
            </div>
        </>
    );
}

StudentExamShow.layout = {
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