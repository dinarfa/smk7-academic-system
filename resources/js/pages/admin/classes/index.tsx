import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Pencil, GraduationCap, Search } from 'lucide-react';
import { useState } from 'react';
import SchoolClassController from '@/actions/App/Http/Controllers/Admin/SchoolClassController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import admin from '@/routes/admin';

type Teacher = {
    id: number;
    name: string;
    email: string;
};

type Department = {
    id: number;
    name: string;
    code: string;
};

type SchoolClass = {
    id: number;
    name: string;
    grade_level: string | null;
    section: number | null;
    code: string | null;
    academic_year: string | null;
    students_count: number;
    homeroom_teacher: Teacher | null;
    department: Department | null;
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
    departments: Department[];
    filters?: {
        search?: string;
    };
};

const GRADE_LEVELS = ['X', 'XI', 'XII'];

export default function AdminSchoolClassesIndex({
    classes,
    teachers,
    departments,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');

    function handleSearch() {
        const params: Record<string, string> = {};

        if (search) {
            params.search = search;
        }

        router.get(admin.classes.index.url(), params, { preserveState: true });
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        grade_level: '',
        department_id: '',
        section: '',
        homeroom_teacher_id: '',
    });

    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const editForm = useForm({
        grade_level: '',
        department_id: '',
        section: '',
        homeroom_teacher_id: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(SchoolClassController.store.url(), {
            onSuccess: () => reset(),
        });
    };

    function openEdit(schoolClass: SchoolClass) {
        setEditingClass(schoolClass);
        editForm.setData({
            grade_level: schoolClass.grade_level ?? '',
            department_id: schoolClass.department
                ? String(schoolClass.department.id)
                : '',
            section: schoolClass.section ? String(schoolClass.section) : '',
            homeroom_teacher_id: schoolClass.homeroom_teacher
                ? String(schoolClass.homeroom_teacher.id)
                : '',
        });
    }

    function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!editingClass) {
            return;
        }

        editForm.put(
            SchoolClassController.update.url({ schoolClass: editingClass.id }),
            {
                onSuccess: () => {
                    setEditingClass(null);
                    editForm.reset();
                },
            },
        );
    }

    function handleDelete(schoolClass: SchoolClass) {
        if (
            !confirm(
                `Hapus kelas "${schoolClass.name}"? Semua data terkait akan ikut terhapus.`,
            )
        ) {
            return;
        }

        router.delete(
            SchoolClassController.destroy.url({ schoolClass: schoolClass.id }),
        );
    }

    return (
        <>
            <Head title="Kelola Kelas" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Kelola Kelas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Buat kelas dan tetapkan wali kelasnya.
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Cari Kelas
                        </label>
                        <Input
                            placeholder="Nama kelas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-56"
                        />
                    </div>
                    <Button onClick={handleSearch} size="sm">
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Buat Kelas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="grade_level">Tingkat</Label>
                                    <Select
                                        value={data.grade_level}
                                        onValueChange={(value) =>
                                            setData('grade_level', value)
                                        }
                                    >
                                        <SelectTrigger
                                            className="w-full"
                                            id="grade_level"
                                        >
                                            <SelectValue placeholder="Pilih Tingkat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GRADE_LEVELS.map((level) => (
                                                <SelectItem
                                                    key={level}
                                                    value={level}
                                                >
                                                    {level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.grade_level && (
                                        <p className="text-xs text-destructive">
                                            {errors.grade_level}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department_id">
                                        Jurusan
                                    </Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(value) =>
                                            setData('department_id', value)
                                        }
                                    >
                                        <SelectTrigger
                                            className="w-full"
                                            id="department_id"
                                        >
                                            <SelectValue placeholder="Pilih Jurusan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.id}
                                                    value={String(dept.id)}
                                                >
                                                    {dept.code} - {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.department_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="section">Nomor Kelas</Label>
                                    <Input
                                        id="section"
                                        name="section"
                                        type="number"
                                        min={1}
                                        value={data.section}
                                        onChange={(event) =>
                                            setData(
                                                'section',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="1"
                                        aria-invalid={Boolean(errors.section)}
                                    />
                                    {errors.section && (
                                        <p className="text-xs text-destructive">
                                            {errors.section}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="homeroom_teacher_id">
                                        Wali Kelas
                                    </Label>
                                    <Select
                                        value={data.homeroom_teacher_id}
                                        onValueChange={(value) =>
                                            setData('homeroom_teacher_id', value)
                                        }
                                    >
                                        <SelectTrigger
                                            className="w-full"
                                            id="homeroom_teacher_id"
                                        >
                                            <SelectValue placeholder="Pilih Guru" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher) => (
                                                <SelectItem
                                                    key={teacher.id}
                                                    value={String(teacher.id)}
                                                >
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.homeroom_teacher_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.homeroom_teacher_id}
                                        </p>
                                    )}
                                </div>

                                {data.grade_level &&
                                    data.department_id &&
                                    data.section && (
                                        <div className="rounded-md bg-muted px-3 py-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Nama kelas:{' '}
                                            </span>
                                            <span className="font-medium">
                                                {data.grade_level}{' '}
                                                {
                                                    departments.find(
                                                        (d) =>
                                                            String(d.id) ===
                                                            data.department_id,
                                                    )?.code
                                                }{' '}
                                                {data.section}
                                            </span>
                                        </div>
                                    )}

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Kelas'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Daftar Kelas Terdaftar</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {classes.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <GraduationCap className="h-10 w-10 text-muted-foreground/50" />
                                    <h3 className="mt-4 text-sm font-medium text-foreground">
                                        Belum Ada Kelas
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Buat kelas baru menggunakan formulir di
                                        sebelah kiri.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {classes.data.map((schoolClass) => (
                                        <div
                                            key={schoolClass.id}
                                            className="flex items-center justify-between rounded-lg border border-border p-4"
                                        >
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {schoolClass.name}
                                                    {schoolClass.department && (
                                                        <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                                            {
                                                                schoolClass
                                                                    .department
                                                                    .code
                                                            }
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Wali Kelas:{' '}
                                                    {schoolClass
                                                        .homeroom_teacher
                                                        ?.name ?? '-'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        openEdit(schoolClass)
                                                    }
                                                    aria-label="Edit kelas"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(
                                                            schoolClass,
                                                        )
                                                    }
                                                    aria-label="Hapus kelas"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Dialog
                    open={editingClass !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingClass(null);
                            editForm.reset();
                        }
                    }}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Kelas</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-grade_level">
                                    Tingkat
                                </Label>
                                <Select
                                    value={editForm.data.grade_level}
                                    onValueChange={(value) =>
                                        editForm.setData('grade_level', value)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="edit-grade_level"
                                    >
                                        <SelectValue placeholder="Pilih Tingkat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GRADE_LEVELS.map((level) => (
                                            <SelectItem
                                                key={level}
                                                value={level}
                                            >
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.grade_level && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.grade_level}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-department_id">
                                    Jurusan
                                </Label>
                                <Select
                                    value={editForm.data.department_id}
                                    onValueChange={(value) =>
                                        editForm.setData('department_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="edit-department_id"
                                    >
                                        <SelectValue placeholder="Pilih Jurusan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem
                                                key={dept.id}
                                                value={String(dept.id)}
                                            >
                                                {dept.code} - {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.department_id && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.department_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-section">Nomor Kelas</Label>
                                <Input
                                    id="edit-section"
                                    type="number"
                                    min={1}
                                    value={editForm.data.section}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'section',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="1"
                                    aria-invalid={Boolean(
                                        editForm.errors.section,
                                    )}
                                />
                                {editForm.errors.section && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.section}
                                    </p>
                                )}
                            </div>

                            {editForm.data.grade_level &&
                                editForm.data.department_id &&
                                editForm.data.section && (
                                    <div className="rounded-md bg-muted px-3 py-2 text-sm">
                                        <span className="text-muted-foreground">
                                            Nama kelas:{' '}
                                        </span>
                                        <span className="font-medium">
                                            {editForm.data.grade_level}{' '}
                                            {
                                                departments.find(
                                                    (d) =>
                                                        String(d.id) ===
                                                        editForm.data
                                                            .department_id,
                                                )?.code
                                            }{' '}
                                            {editForm.data.section}
                                        </span>
                                    </div>
                                )}

                            <div className="space-y-2">
                                <Label htmlFor="edit-teacher">Wali Kelas</Label>
                                <Select
                                    value={editForm.data.homeroom_teacher_id}
                                    onValueChange={(value) =>
                                        editForm.setData(
                                            'homeroom_teacher_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="edit-teacher"
                                    >
                                        <SelectValue placeholder="Pilih Guru" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((teacher) => (
                                            <SelectItem
                                                key={teacher.id}
                                                value={String(teacher.id)}
                                            >
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.homeroom_teacher_id && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.homeroom_teacher_id}
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingClass(null);
                                        editForm.reset();
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                >
                                    {editForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

AdminSchoolClassesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Kelola Kelas', href: admin.classes.index.url() },
    ],
};
