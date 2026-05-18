import { Head, Link } from '@inertiajs/react'
import ExamController from '@/actions/App/Http/Controllers/Teacher/ExamController'
import QuestionController from '@/actions/App/Http/Controllers/Teacher/QuestionController'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboard } from '@/routes'

type Exam = {
  id: number
  title: string
}

type AnswerOption = {
  id: number
  option_text: string
  is_correct: boolean
}

type Question = {
  id: number
  prompt: string
  type: string
  points: number
  sort_order: number
  explanation?: string
  answer_options: AnswerOption[]
}

type Props = {
  exam: Exam
  questions: Question[]
}

export default function Index({ exam, questions }: Props) {
  return (
    <>
      <Head title={`${exam.title} - Soal`} />
      <div className="space-y-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{exam.title}</h1>
            <p className="mt-2 text-muted-foreground">
              Di halaman ini Anda menambahkan, mengedit, dan menghapus soal untuk ujian ini.
            </p>
          </div>
          <Button asChild>
            <Link href={QuestionController.create.url({ exam: exam.id })}>Tambah Soal</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Soal</CardTitle>
            <CardDescription>
              Total {questions.length} soal pada ujian ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada soal. Klik tombol Tambah Soal untuk mulai membuat soal.
              </p>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Urutan {question.sort_order}</p>
                          <div 
                            className="font-medium text-foreground prose prose-sm max-w-none dark:prose-invert mt-1"
                            dangerouslySetInnerHTML={{ __html: question.prompt }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Tipe: {question.type} · Poin: {question.points}
                        </p>
                        {question.explanation && (
                          <p className="text-sm text-muted-foreground">
                            Penjelasan: {question.explanation}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={QuestionController.edit.url({ exam: exam.id, question: question.id })}>
                            Edit
                          </Link>
                        </Button>
                        <Button asChild variant="destructive" size="sm">
                          <Link
                            href={QuestionController.destroy.url({ exam: exam.id, question: question.id })}
                            method="delete"
                            as="button"
                          >
                            Hapus
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {question.answer_options?.length > 0 && (
                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {question.answer_options.map((option) => (
                          <div
                            key={option.id}
                            className={`rounded-md border p-3 text-sm ${option.is_correct ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-background'}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div 
                                className="prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: option.option_text }}
                              />
                              {option.is_correct && (
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">
                                  Benar
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Ujian', href: ExamController.index.url() },
        { title: 'Soal', href: '#' },
    ],
}
