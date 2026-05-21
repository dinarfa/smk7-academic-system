import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Settings2, Pencil, Trash2, Library, ChevronLeft, ChevronRight } from 'lucide-react';
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
    id: number;
    code: string;
    name: string;
    school_class: {
        id: number;
        name: string;
    } | null;
    teacher: {
        id: number;
        name: string;
    } | null;
    created_at: string | null;
    updated_at: string | null;
};

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
        school_class_id: '',
        teacher_id: '',
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        post(admin.subjects.store.url(), {
            onSuccess: () => reset(),
        });
    }

    return (
        <AdminLayout title="Mata Pelajaran">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-8">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                        Manajemen Mapel
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Mata Pelajaran
                    </h1>
                    <p className="mt-1.5 text-slate-500">
                        Buat dan kelola mata pelajaran untuk sistem CBT.
                    </p>
                </div>
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
                                <Label htmlFor="school_class_id" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kelas</Label>
                                <Select
                                    value={data.school_class_id}
                                    onValueChange={(value) => setData('school_class_id', value)}
                                >
                                    <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" id="school_class_id">
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {classes.map((schoolClass) => (
                                            <SelectItem key={schoolClass.id} value={String(schoolClass.id)} className="rounded-lg">
                                                {schoolClass.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.school_class_id && (
                                    <p className="text-xs text-red-500">{errors.school_class_id}</p>
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-4 py-4 pl-6">Kode</th>
                                            <th className="px-4 py-4">Nama Mata Pelajaran</th>
                                            <th className="px-4 py-4">Kelas</th>
                                            <th className="px-4 py-4">Guru</th>
                                            <th className="px-4 py-4 pr-6 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {subjects.data.map((subject) => (
                                            <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-4 pl-6 whitespace-nowrap font-medium text-slate-700">
                                                    <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                                                        {subject.code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-900">
                                                    {subject.name}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-slate-700">
                                                    {subject.school_class ? subject.school_class.name : '-'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-slate-700">
                                                    {subject.teacher ? subject.teacher.name : '-'}
                                                </td>
                                                <td className="px-4 py-4 pr-6 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                                            <Link href={admin.subjects.edit.url({ subject: subject.id })}><Pencil className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                                                            <Link
                                                                href={admin.subjects.destroy.url({ subject: subject.id })}
                                                                method="delete"
                                                                as="button"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
    );
}