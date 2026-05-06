import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
};

type Question = {
    id: number;
    prompt: string;
    type: string;
    points: number;
    answer_options: AnswerOption[];
    response: QuestionResponse | null;
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
    const { data, setData, put, processing } = useForm({
        grades: questions.map((q) => ({
            question_id: q.id,
            points_awarded: q.response?.points_awarded ?? 0,
        })),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(teacher.exams.attempts.updateCorrection.url({ exam: exam.id, attempt: attempt.id }));
    };

    const handlePointChange = (questionId: number, value: string) => {
        const numValue = parseFloat(value) || 0;
        setData(
            'grades',
            data.grades.map((g) => (g.question_id === questionId ? { ...g, points_awarded: numValue } : g))
        );
    };

    return (
        <>
            <Head title={`Koreksi Ujian: ${attempt.student_name}`} />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Koreksi Jawaban</h1>
                        <p className="mt-2 text-muted-foreground">{attempt.student_name} - {exam.title}</p>
                    </div>

                    <div className="flex gap-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href={teacher.exams.results.url({ exam: exam.id })}>Kembali ke Hasil</Link>
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {questions.map((question, index) => {
                        const grade = data.grades.find((g) => g.question_id === question.id);
                        const isEssay = question.type === 'essay';

                        return (
                            <Card key={question.id} className={isEssay ? 'border-primary/50 border-2' : ''}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-lg">Soal {index + 1}</CardTitle>
                                        <CardDescription>
                                            Tipe: {question.type === 'multiple_choice' ? 'Pilihan Ganda' : question.type === 'essay' ? 'Esai' : question.type === 'true_false' ? 'Benar / Salah' : 'Objektif'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`points-${question.id}`}>Poin:</Label>
                                        <Input
                                            id={`points-${question.id}`}
                                            type="number"
                                            min="0"
                                            max={question.points}
                                            step="0.5"
                                            className="w-24 text-right"
                                            value={grade?.points_awarded ?? ''}
                                            onChange={(e) => handlePointChange(question.id, e.target.value)}
                                        />
                                        <span className="text-sm text-muted-foreground">/ {question.points}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div 
                                        className="rounded-md bg-muted p-4 prose prose-sm max-w-none dark:prose-invert"
                                        dangerouslySetInnerHTML={{ __html: question.prompt }}
                                    />

                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Jawaban Siswa:</h4>
                                        {question.response ? (
                                            <div className="rounded-md border p-4 bg-background">
                                                {question.type === 'multiple_choice' || question.type === 'true_false' ? (
                                                    <div 
                                                        className="prose prose-sm max-w-none dark:prose-invert"
                                                        dangerouslySetInnerHTML={{ __html: question.answer_options.find((opt) => opt.id === question.response?.answer_option_id)?.option_text ?? '-' }}
                                                    />
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{question.response.response_text ?? '-'}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm italic text-muted-foreground">Siswa tidak menjawab soal ini.</p>
                                        )}
                                    </div>

                                    {question.type !== 'essay' && (
                                        <div>
                                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Kunci Jawaban:</h4>
                                            <ul className="list-disc list-inside text-sm">
                                                {question.answer_options.filter((opt) => opt.is_correct).map((opt) => (
                                                    <li key={opt.id} className="text-green-600 dark:text-green-500">
                                                        <div dangerouslySetInnerHTML={{ __html: opt.option_text }} className="inline-block prose-sm prose dark:prose-invert" />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={teacher.exams.results.url({ exam: exam.id })}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Nilai'}
                        </Button>
                    </div>
                </form>
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
