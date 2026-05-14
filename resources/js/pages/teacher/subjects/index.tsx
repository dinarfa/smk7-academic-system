import { Head } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboard } from '@/routes'

type Subject = {
    id: number
    code: string | null
    name: string
    class: string | null
}

type Props = {
    subjects: Subject[]
}

export default function TeacherSubjectsIndex({ subjects }: Props) {
    return (
        <>
            <Head title="Mata Pelajaran" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Mata Pelajaran</h1>
                    <p className="text-muted-foreground">Mata pelajaran yang ditetapkan kepada Anda oleh admin.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Mapel Anda</CardTitle>
                        <CardDescription>Daftar mata pelajaran yang Anda ampu.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada mata pelajaran yang ditetapkan.</p>
                        ) : (
                            <div className="space-y-3">
                                {subjects.map((subject) => (
                                    <div key={subject.id} className="rounded-lg border border-border p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-foreground">{subject.name}</p>
                                                <p className="text-sm text-muted-foreground">Kode: {subject.code ?? '-'}</p>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Kelas: {subject.class ?? '-'}
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
    )
}

TeacherSubjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Mata Pelajaran', href: '#' },
    ],
}
