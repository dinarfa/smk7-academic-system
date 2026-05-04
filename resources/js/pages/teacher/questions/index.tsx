import { Head, Link } from '@inertiajs/react'
import QuestionController from '@/actions/App/Http/Controllers/Teacher/QuestionController'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Index({ exam, questions }) {
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
                          <p className="font-medium text-foreground">{question.prompt}</p>
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
                              <p>{option.option_text}</p>
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
