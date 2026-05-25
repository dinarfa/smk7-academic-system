import { Link, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';
import admin from '@/routes/admin';

type Subject = {
    id: number
    code: string
    name: string
    school_classes: { id: number; name: string }[]
    teacher: { id: number; name: string } | null
    created_at: string | null
    updated_at: string | null
}

type SchoolClass = {
    id: number;
    name: string;
};

type Teacher = {
    id: number;
    name: string;
    email: string;
};

type Props = {
    classes: SchoolClass[];
    teachers: Teacher[];
    subjects: {
        data: Subject[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
};

export default function AdminSubjectsIndex({ classes, teachers, subjects }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        school_class_ids: [] as string[],
        teacher_id: '',
    });

    function toggleClass(classId: string) {
        setData('school_class_ids',
            data.school_class_ids.includes(classId)
                ? data.school_class_ids.filter((id) => id !== classId)
                : [...data.school_class_ids, classId]
        )
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        post(admin.subjects.store.url(), {
            onSuccess: () => reset(),
        });
    }

    return (
        <AdminLayout title="Mata Pelajaran">
            <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold text-foreground">Mata Pelajaran</h1>
                <p className="text-muted-foreground">Buat dan kelola mata pelajaran untuk setiap kelas.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm h-fit">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                                <Plus className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Buat Mata Pelajaran</p>
                                <p className="text-xs text-slate-500">Tambah mata pelajaran baru dengan kode unik.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kode Mapel</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    value={data.code}
                                    onChange={(event) => setData('code', event.target.value)}
                                    placeholder="MTK"
                                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
                                    aria-invalid={Boolean(errors.code)}
                                />
                                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Kelas</Label>
                                <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3">
                                    {classes.map((schoolClass) => (
                                        <label
                                            key={schoolClass.id}
                                            className="flex items-center gap-2 text-sm cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={data.school_class_ids.includes(String(schoolClass.id))}
                                                onCheckedChange={() => toggleClass(String(schoolClass.id))}
                                            />
                                            {schoolClass.name}
                                        </label>
                                    ))}
                                </div>
                                {errors.school_class_ids && (
                                    <p className="text-sm text-destructive">{errors.school_class_ids}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher_id" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Guru</Label>
                                <Select
                                    value={data.teacher_id}
                                    onValueChange={(value) => setData('teacher_id', value)}
                                >
                                    <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" id="teacher_id">
                                        <SelectValue placeholder="Pilih Guru" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={String(teacher.id)} className="rounded-lg">
                                                {teacher.name} ({teacher.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.teacher_id && (
                                    <p className="text-xs text-red-500">{errors.teacher_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Mata Pelajaran</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    placeholder="Matematika"
                                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
                                    aria-invalid={Boolean(errors.name)}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <Button type="submit" disabled={processing} className="w-full gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Mapel'}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                                <Library className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Mapel Terdaftar</p>
                                <p className="text-xs text-slate-500">Edit atau hapus mata pelajaran.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        {subjects.data.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-12">Belum ada mata pelajaran dibuat.</p>
                        ) : (
                            subjects.data.map((subject) => (
                                <div key={subject.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                                    <div>
                                        <p className="font-medium text-foreground">{subject.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Kode: {subject.code} &middot;{' '}
                                            {subject.school_classes.length > 0
                                                ? subject.school_classes.map((c) => c.name).join(', ')
                                                : 'Belum ada kelas'}
                                        </p>
                                        {subject.teacher && (
                                            <p className="text-xs text-muted-foreground">
                                                Guru: {subject.teacher.name}
                                            </p>
                                        )}
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
                    </div>
                    {/* Pagination */}
                    {subjects.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                            <span className="text-xs text-slate-400">
                                Halaman <span className="font-semibold text-slate-600">{subjects.current_page}</span> dari <span className="font-semibold text-slate-600">{subjects.last_page}</span>
                            </span>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!subjects.prev_page_url} asChild={!!subjects.prev_page_url}>
                                    {subjects.prev_page_url ? <Link href={subjects.prev_page_url}><ChevronLeft className="h-4 w-4" /></Link> : <span><ChevronLeft className="h-4 w-4" /></span>}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!subjects.next_page_url} asChild={!!subjects.next_page_url}>
                                    {subjects.next_page_url ? <Link href={subjects.next_page_url}><ChevronRight className="h-4 w-4" /></Link> : <span><ChevronRight className="h-4 w-4" /></span>}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
