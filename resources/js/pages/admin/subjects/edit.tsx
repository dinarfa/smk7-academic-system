import { Link, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

type Subject = {
    id: number
    code: string
    name: string
    school_class_id: number | null
    teacher_id: number | null
}

type SchoolClass = {
    id: number
    name: string
}

type Teacher = {
    id: number
    name: string
    email: string
}

type Props = {
    subject: Subject
    classes: SchoolClass[]
    teachers: Teacher[]
}

export default function AdminSubjectEdit({ subject, classes, teachers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: subject.code,
        name: subject.name,
        school_class_id: subject.school_class_id ? String(subject.school_class_id) : '',
        teacher_id: subject.teacher_id ? String(subject.teacher_id) : '',
    })

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        put(admin.subjects.update.url({ subject: subject.id }))
    }

    return (
        <AdminLayout title="Edit Mata Pelajaran">
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Edit Mata Pelajaran</h1>
                        <p className="text-muted-foreground">Perbarui kode dan nama mata pelajaran.</p>
                    </div>
                    <Button asChild variant="secondary">
                        <Link href={admin.subjects.index.url()}>Kembali</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Mata Pelajaran</CardTitle>
                        <CardDescription>Perbarui informasi mata pelajaran.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode Mapel</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    value={data.code}
                                    onChange={(event) => setData('code', event.target.value)}
                                    aria-invalid={Boolean(errors.code)}
                                />
                                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="school_class_id">Kelas</Label>
                                <Select
                                    value={data.school_class_id}
                                    onValueChange={(value) => setData('school_class_id', value)}
                                >
                                    <SelectTrigger className="w-full" id="school_class_id">
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((schoolClass) => (
                                            <SelectItem key={schoolClass.id} value={String(schoolClass.id)}>
                                                {schoolClass.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.school_class_id && (
                                    <p className="text-sm text-destructive">{errors.school_class_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher_id">Guru</Label>
                                <Select
                                    value={data.teacher_id}
                                    onValueChange={(value) => setData('teacher_id', value)}
                                >
                                    <SelectTrigger className="w-full" id="teacher_id">
                                        <SelectValue placeholder="Pilih Guru" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={String(teacher.id)}>
                                                {teacher.name} ({teacher.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.teacher_id && (
                                    <p className="text-sm text-destructive">{errors.teacher_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Mata Pelajaran</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    aria-invalid={Boolean(errors.name)}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={admin.subjects.index.url()}>Batal</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}