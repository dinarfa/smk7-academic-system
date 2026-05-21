import { Link, useForm } from '@inertiajs/react';
import SchoolClassController from '@/actions/App/Http/Controllers/Admin/SchoolClassController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, Settings2, Trash2, Pencil } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';
import admin from '@/routes/admin';

type Teacher = {
    id: number;
    name: string;
    email: string;
};

type SchoolClass = {
    id: number;
    name: string;
    code: string | null;
    academic_year: string | null;
    students_count: number;
    homeroom_teacher: Teacher | null;
};

type Props = {
    classes: {
        data: SchoolClass[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    teachers: Teacher[];
};

export default function AdminSchoolClassesIndex({ classes, teachers }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        teacher_id: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(SchoolClassController.store.url(), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AdminLayout title="Kelola Kelas">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-8">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                        Manajemen Kelas
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Kelola Kelas
                    </h1>
                    <p className="mt-1.5 text-slate-500">
                        Buat kelas dan tetapkan wali kelasnya.
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
                                <p className="font-semibold text-slate-800">Buat Kelas</p>
                                <p className="text-xs text-slate-500">Tambah kelas baru dan tetapkan wali kelas.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Kelas</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    placeholder="Kelas 10A"
                                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
                                    aria-invalid={Boolean(errors.name)}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher_id" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wali Kelas</Label>
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
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.teacher_id && (
                                    <p className="text-xs text-red-500">{errors.teacher_id}</p>
                                )}
                            </div>

                            <Button type="submit" disabled={processing} className="w-full gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Kelas'}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                                <BookOpen className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Daftar Kelas Terdaftar</p>
                                <p className="text-xs text-slate-500">Daftar semua kelas beserta wali kelas dan jumlah siswa.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        {classes.data.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-12">Belum ada kelas dibuat.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-4 py-4 pl-6">Nama Kelas</th>
                                            <th className="px-4 py-4">Wali Kelas</th>
                                            <th className="px-4 py-4">Tahun Ajaran</th>
                                            <th className="px-4 py-4 text-center">Total Siswa</th>
                                            <th className="px-4 py-4 pr-6 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {classes.data.map((schoolClass) => (
                                            <tr key={schoolClass.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-4 pl-6 font-medium text-slate-900 whitespace-nowrap">
                                                    {schoolClass.name}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-700">
                                                    {schoolClass.homeroom_teacher?.name ?? '-'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {schoolClass.academic_year ?? '-'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                                                        {schoolClass.students_count}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 pr-6 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                                            <Link href={`/admin/classes/${schoolClass.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                                                            <Link href={`/admin/classes/${schoolClass.id}`} method="delete" as="button">
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
                </div>
            </div>
        </AdminLayout>
    );
}
