import { Head, Link, useForm } from '@inertiajs/react'
import QuestionController from '@/actions/App/Http/Controllers/Teacher/QuestionController'
import RichEditor from '@/components/RichEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Exam = {
  id: number
  title: string
}

type AnswerOption = {
  id?: number
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
  question: Question
}

export default function Edit({ exam, question }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    prompt: question.prompt,
    type: question.type,
    points: String(question.points),
    sort_order: String(question.sort_order ?? 0),
    explanation: question.explanation ?? '',
    answer_options: question.answer_options.length > 0
      ? question.answer_options.map((option) => ({
          option_text: option.option_text,
          is_correct: option.is_correct,
        }))
      : [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
        ],
  })

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    put(QuestionController.update.url({ exam: exam.id, question: question.id }))
  }

  return (
    <>
      <Head title={`Edit Question - ${exam.title}`} />
      <div className="space-y-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Edit Question</h1>
            <p className="mt-2 text-muted-foreground">{exam.title}</p>
          </div>
          <Button asChild variant="secondary">
            <Link href={QuestionController.index.url({ exam: exam.id })}>Kembali</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>Update the prompt, points, and answer options.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Pertanyaan</Label>
                <div className="min-h-[300px]">
                  <RichEditor
                    value={data.prompt}
                    onChange={(val) => setData('prompt', val)}
                    placeholder="Ketik soal di sini..."
                  />
                </div>
                {errors.prompt && <p className="text-sm text-destructive">{errors.prompt}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe</Label>
                  <select
                    id="type"
                    name="type"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={data.type}
                    onChange={(event) => {
                      const newType = event.target.value;
                      setData('type', newType);
                    }}
                  >
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="essay">Esai</option>
                  </select>
                  {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Poin</Label>
                  <Input
                    id="points"
                    name="points"
                    type="number"
                    min={1}
                    max={100}
                    value={data.points}
                    onChange={(event) => setData('points', event.target.value)}
                  />
                  {errors.points && <p className="text-sm text-destructive">{errors.points}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Urutan</Label>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    min={0}
                    value={data.sort_order}
                    onChange={(event) => setData('sort_order', event.target.value)}
                  />
                  {errors.sort_order && <p className="text-sm text-destructive">{errors.sort_order}</p>}
                </div>
              </div>

              {data.type !== 'essay' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Jawaban</Label>
                    <span className="text-xs text-muted-foreground">Minimal 2 jawaban, 1 benar</span>
                  </div>

                  <div className="space-y-3">
                    {data.answer_options.map((option, index) => (
                      <div key={index} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_auto_auto]">
                        <div className="space-y-2">
                          <Label>Opsi {index + 1}</Label>
                          <div className="min-h-[150px]">
                            <RichEditor
                              height={150}
                              value={option.option_text}
                              onChange={(val) => {
                                const next = [...data.answer_options]
                                next[index] = { ...next[index], option_text: val }
                                setData('answer_options', next)
                              }}
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 pt-8 text-sm">
                          {data.type === 'objective' ? (
                            <span className="text-muted-foreground italic">Jawaban Benar</span>
                          ) : (
                            <input
                              type="radio"
                              name="correct_answer"
                              checked={option.is_correct}
                              onChange={() => {
                                const next = data.answer_options.map((opt, i) => ({
                                  ...opt,
                                  is_correct: i === index,
                                }));
                                setData('answer_options', next);
                              }}
                            />
                          )}
                          {data.type !== 'objective' && 'Benar'}
                        </label>
                        {data.type !== 'true_false' && data.answer_options.length > 2 && (
                          <div className="pt-8">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                const next = data.answer_options.filter((_, i) => i !== index);
                                setData('answer_options', next);
                              }}
                            >
                              &times;
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {data.type !== 'true_false' && data.answer_options.length < 10 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setData('answer_options', [
                          ...data.answer_options,
                          { option_text: '', is_correct: false }
                        ]);
                      }}
                    >
                      + Tambah Opsi
                    </Button>
                  )}

                  {errors.answer_options && <p className="text-sm text-destructive">{errors.answer_options}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="explanation">Pembahasan (Opsional)</Label>
                <p className="text-xs text-muted-foreground">
                  Penjelasan atau langkah-langkah penyelesaian soal. Siswa dapat melihat pembahasan ini setelah ujian selesai sebagai bahan evaluasi belajar.
                </p>
                <textarea
                  id="explanation"
                  name="explanation"
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={data.explanation}
                  onChange={(event) => setData('explanation', event.target.value)}
                />
                {errors.explanation && <p className="text-sm text-destructive">{errors.explanation}</p>}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                <Button asChild variant="outline">
                  <Link href={QuestionController.index.url({ exam: exam.id })}>Batal</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
