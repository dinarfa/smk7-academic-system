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
    created_at: string | null
    updated_at: string | null
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
    classes: SchoolClass[]
    teachers: Teacher[]
    subjects: {
        data: Subject[]
        current_page: number
        last_page: number
        prev_page_url: string | null
        next_page_url: string | null
    }
}

export default function AdminSubjectsIndex({ classes, teachers, subjects }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        school_class_id: '',
        teacher_id: '',
    })

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        post(admin.subjects.store.url(), {
            onSuccess: () => reset(),
        })
    }

    return (
        <AdminLayout title="Mata Pelajaran">
            <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold text-foreground">Mata Pelajaran</h1>
                <p className="text-muted-foreground">Buat dan kelola mata pelajaran untuk CBT.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Buat Mata Pelajaran</CardTitle>
                        <CardDescription>Tambah mata pelajaran baru dengan kode unik.</CardDescription>
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
                                    placeholder="MTK"
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
                                    placeholder="Matematika"
                                    aria-invalid={Boolean(errors.name)}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Mapel'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mapel Terdaftar</CardTitle>
                        <CardDescription>Edit atau hapus mata pelajaran sesuai kebutuhan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {subjects.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada mata pelajaran dibuat.</p>
                        ) : (
                            subjects.data.map((subject) => (
                                <div key={subject.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                                    <div>
                                        <p className="font-medium text-foreground">{subject.name}</p>
                                        <p className="text-sm text-muted-foreground">Kode: {subject.code}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button asChild variant="link" className="h-auto p-0">
                                            <Link href={admin.subjects.edit.url({ subject: subject.id })}>Edit</Link>
                                        </Button>
                                        <Button asChild variant="link" className="h-auto p-0 text-destructive">
                                            <Link
                                                href={admin.subjects.destroy.url({ subject: subject.id })}
                                                method="delete"
                                                as="button"
                                            >
                                                Hapus
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                Halaman {subjects.current_page} dari {subjects.last_page}
                            </span>
                            <div className="flex gap-3">
                                {subjects.prev_page_url && (
                                    <Link href={subjects.prev_page_url} className="text-primary hover:underline">
                                        Sebelumnya
                                    </Link>
                                )}
                                {subjects.next_page_url && (
                                    <Link href={subjects.next_page_url} className="text-primary hover:underline">
                                        Selanjutnya
                                    </Link>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            </div>
        </AdminLayout>
    )
}