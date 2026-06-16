import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useMemo, useState } from 'react';
import HtmlPreview from '@/components/html-preview';
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
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import teacher from '@/routes/teacher';

type AnswerOption = {
    id: number;
    option_text: string;
    is_correct: boolean;
};

type QuestionResponse = {
    id: number;
    response_text: string | null;
    answer_option_id: number | null;
    is_correct: boolean | null;
    points_awarded: number | null;
    feedback: string | null;
};

type Question = {
    id: number;
    prompt: string;
    type: string;
    points: number;
    answer_options: AnswerOption[];
    response: QuestionResponse | null;
};

type GradeEntry = {
    question_id: number;
    points_awarded: number;
    feedback: string;
};

type Props = {
    exam: {
        id: number;
        title: string;
    };
    attempt: {
        id: number;
        student_name: string;
        status: string;
        score: string | number;
    };
    questions: Question[];
};

export default function ExamCorrection({ exam, attempt, questions }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    const { data, setData, put, processing } = useForm({
        grades: questions.map(
            (q): GradeEntry => ({
                question_id: q.id,
                points_awarded: q.response?.points_awarded ?? 0,
                feedback: q.response?.feedback ?? '',
            }),
        ),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(
            teacher.exams.attempts.updateCorrection.url({
                exam: exam.id,
                attempt: attempt.id,
            }),
        );
    };

    const handlePointChange = (questionId: number, value: string) => {
        const numValue = parseFloat(value) || 0;
        setData(
            'grades',
            data.grades.map((g) =>
                g.question_id === questionId
                    ? { ...g, points_awarded: numValue }
                    : g,
            ),
        );
    };

    const handleFeedbackChange = (questionId: number, value: string) => {
        setData(
            'grades',
            data.grades.map((g) =>
                g.question_id === questionId
                    ? { ...g, feedback: value }
                    : g,
            ),
        );
    };

    const handleQuickScore = (questionId: number, score: number) => {
        setData(
            'grades',
            data.grades.map((g) =>
                g.question_id === questionId
                    ? { ...g, points_awarded: score }
                    : g,
            ),
        );
    };

    // Summary calculations
    const summary = useMemo(() => {
        const totalPointsAwarded = data.grades.reduce(
            (sum, g) => sum + g.points_awarded,
            0,
        );
        const totalPossiblePoints = questions.reduce(
            (sum, q) => sum + q.points,
            0,
        );
        const gradedCount = data.grades.filter(
            (g, i) =>
                g.points_awarded > 0 ||
                questions[i]?.response !== null,
        ).length;
        const normalizedScore =
            totalPossiblePoints > 0
                ? Math.round((totalPointsAwarded / totalPossiblePoints) * 100)
                : 0;

        return {
            totalPointsAwarded,
            totalPossiblePoints,
            gradedCount,
            totalQuestions: questions.length,
            normalizedScore,
        };
    }, [data.grades, questions]);

    // Check if a question has been graded (has response or non-zero points)
    const isQuestionGraded = (index: number): boolean => {
        const q = questions[index];
        if (!q?.response) return false;
        const grade = data.grades[index];
        return grade !== undefined;
    };

    const currentQuestion = questions[activeIndex];
    const currentGrade = data.grades[activeIndex];

    const typeLabel = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return 'Pilihan Ganda';
            case 'essay':
                return 'Esai';
            case 'true_false':
                return 'Benar / Salah';
            default:
                return 'Objektif';
        }
    };

    return (
        <>
            <Head title={`Koreksi Ujian: ${attempt.student_name}`} />

            <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
                {/* Sidebar - Question Navigation */}
                <aside className="w-full border-b bg-muted/30 p-4 lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-foreground">
                            Navigasi Soal
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {summary.gradedCount}/{summary.totalQuestions} soal
                            sudah dikoreksi
                        </p>
                        {/* Progress bar */}
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                    width: `${(summary.gradedCount / summary.totalQuestions) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                        {questions.map((q, index) => {
                            const hasResponse = q.response !== null;
                            const isActive = index === activeIndex;

                            return (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : hasResponse
                                              ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <span className="hidden truncate lg:inline">
                                        {typeLabel(q.type)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Summary Card */}
                    <div className="mt-6 rounded-lg border bg-card p-4">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                            Ringkasan
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Total Poin
                                </span>
                                <span className="font-medium">
                                    {summary.totalPointsAwarded} /{' '}
                                    {summary.totalPossiblePoints}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Prediksi Nilai
                                </span>
                                <span className="font-medium">
                                    {summary.normalizedScore}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                        summary.normalizedScore >= 70
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : summary.normalizedScore >= 50
                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}
                                >
                                    {summary.normalizedScore >= 70
                                        ? 'Lulus'
                                        : summary.normalizedScore >= 50
                                          ? 'Cukup'
                                          : 'Gagal'}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <div className="mx-auto max-w-3xl">
                        {/* Header */}
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    Koreksi Jawaban
                                </h1>
                                <p className="mt-1 text-muted-foreground">
                                    {attempt.student_name} &mdash; {exam.title}
                                </p>
                            </div>
                            <Button type="button" variant="outline" asChild>
                                <Link
                                    href={teacher.exams.results.url({
                                        exam: exam.id,
                                    })}
                                >
                                    Kembali ke Hasil
                                </Link>
                            </Button>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Current Question Card */}
                            {currentQuestion && currentGrade && (
                                <Card
                                    key={currentQuestion.id}
                                    className={
                                        currentQuestion.type === 'essay'
                                            ? 'border-2 border-primary/50'
                                            : ''
                                    }
                                >
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                        <div>
                                            <CardTitle className="text-lg">
                                                Soal {activeIndex + 1}
                                            </CardTitle>
                                            <CardDescription>
                                                Tipe:{' '}
                                                {typeLabel(currentQuestion.type)}{' '}
                                                &middot; Maks{' '}
                                                {currentQuestion.points} poin
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label
                                                htmlFor={`points-${currentQuestion.id}`}
                                            >
                                                Poin:
                                            </Label>
                                            <Input
                                                id={`points-${currentQuestion.id}`}
                                                type="number"
                                                min="0"
                                                max={currentQuestion.points}
                                                step="0.5"
                                                className="w-24 text-right"
                                                value={
                                                    currentGrade.points_awarded ??
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    handlePointChange(
                                                        currentQuestion.id,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                / {currentQuestion.points}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Question Prompt */}
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                                Soal:
                                            </h4>
                                            <div className="rounded-md border bg-muted/50 p-4">
                                                <HtmlPreview
                                                    content={
                                                        currentQuestion.prompt
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Answer Options (for objective questions) */}
                                        {currentQuestion.type !== 'essay' &&
                                            currentQuestion.answer_options
                                                .length > 0 && (
                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                                        Pilihan Jawaban:
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {currentQuestion.answer_options.map(
                                                            (opt) => {
                                                                const isSelected =
                                                                    currentQuestion
                                                                        .response
                                                                        ?.answer_option_id ===
                                                                    opt.id;
                                                                return (
                                                                    <div
                                                                        key={
                                                                            opt.id
                                                                        }
                                                                        className={`flex items-start gap-3 rounded-md border p-3 ${
                                                                            opt.is_correct
                                                                                ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                                                                                : isSelected
                                                                                  ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                                                                                  : 'bg-background'
                                                                        }`}
                                                                    >
                                                                        <span
                                                                            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                                                opt.is_correct
                                                                                    ? 'bg-green-500 text-white'
                                                                                    : isSelected
                                                                                      ? 'bg-red-500 text-white'
                                                                                      : 'bg-muted text-muted-foreground'
                                                                            }`}
                                                                        >
                                                                            {opt.is_correct
                                                                                ? '✓'
                                                                                : isSelected
                                                                                  ? '✗'
                                                                                  : ''}
                                                                        </span>
                                                                        <HtmlPreview
                                                                            content={
                                                                                opt.option_text
                                                                            }
                                                                            className="flex-1"
                                                                        />
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Student Answer */}
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                                Jawaban Siswa:
                                            </h4>
                                            {currentQuestion.response ? (
                                                <div className="rounded-md border bg-background p-4">
                                                    {currentQuestion.type ===
                                                        'multiple_choice' ||
                                                    currentQuestion.type ===
                                                        'true_false' ? (
                                                        <HtmlPreview
                                                            content={
                                                                currentQuestion.answer_options.find(
                                                                    (opt) =>
                                                                        opt.id ===
                                                                        currentQuestion
                                                                            .response
                                                                            ?.answer_option_id,
                                                                )
                                                                    ?.option_text ??
                                                                '-'
                                                            }
                                                        />
                                                    ) : (
                                                        <p className="whitespace-pre-wrap text-sm">
                                                            {currentQuestion
                                                                .response
                                                                .response_text ??
                                                                '-'}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm italic text-muted-foreground">
                                                    Siswa tidak menjawab soal
                                                    ini.
                                                </p>
                                            )}
                                        </div>

                                        {/* Quick Score Buttons */}
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                                Skor Cepat:
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {[0, 1, 2, 3, 4, 5].map(
                                                    (score) =>
                                                        score <=
                                                            currentQuestion.points && (
                                                            <Button
                                                                key={score}
                                                                type="button"
                                                                variant={
                                                                    currentGrade.points_awarded ===
                                                                    score
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleQuickScore(
                                                                        currentQuestion.id,
                                                                        score,
                                                                    )
                                                                }
                                                            >
                                                                {score}
                                                            </Button>
                                                        ),
                                                )}
                                            </div>
                                        </div>

                                        {/* Feedback Textarea */}
                                        <div>
                                            <Label
                                                htmlFor={`feedback-${currentQuestion.id}`}
                                            >
                                                Catatan (opsional)
                                            </Label>
                                            <Textarea
                                                id={`feedback-${currentQuestion.id}`}
                                                placeholder="Tambahkan catatan atau umpan balik untuk soal ini..."
                                                className="mt-1.5"
                                                rows={3}
                                                value={currentGrade.feedback}
                                                onChange={(e) =>
                                                    handleFeedbackChange(
                                                        currentQuestion.id,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={activeIndex === 0}
                                    onClick={() =>
                                        setActiveIndex((i) =>
                                            Math.max(0, i - 1),
                                        )
                                    }
                                >
                                    &larr; Sebelumnya
                                </Button>

                                <span className="text-sm text-muted-foreground">
                                    Soal {activeIndex + 1} dari{' '}
                                    {questions.length}
                                </span>

                                {activeIndex < questions.length - 1 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setActiveIndex((i) =>
                                                Math.min(
                                                    questions.length - 1,
                                                    i + 1,
                                                ),
                                            )
                                        }
                                    >
                                        Selanjutnya &rarr;
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Simpan Semua Nilai'}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}

ExamCorrection.layout = {
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
        {
            title: 'Koreksi',
            href: '',
        },
    ],
};
