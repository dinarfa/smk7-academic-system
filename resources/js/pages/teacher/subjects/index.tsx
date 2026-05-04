import { Head } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
            <Head title="Subject Management" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Subject Management</h1>
                    <p className="mt-2 text-muted-foreground">Subjects assigned to you by the admin.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Subjects</CardTitle>
                        <CardDescription>Review the subjects you are responsible for.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No subjects assigned yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {subjects.map((subject) => (
                                    <div key={subject.id} className="rounded-lg border border-border p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-foreground">{subject.name}</p>
                                                <p className="text-sm text-muted-foreground">Code: {subject.code ?? '-'}</p>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Class: {subject.class ?? '-'}
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
