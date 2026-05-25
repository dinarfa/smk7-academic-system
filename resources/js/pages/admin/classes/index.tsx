import { Link, useForm, router } from '@inertiajs/react';
import SchoolClassController from '@/actions/App/Http/Controllers/Admin/SchoolClassController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import AdminLayout from '@/layouts/AdminLayout';
import admin from '@/routes/admin';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const editForm = useForm({
        name: '',
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
            name: schoolClass.name,
            homeroom_teacher_id: schoolClass.homeroom_teacher ? String(schoolClass.homeroom_teacher.id) : '',
        });
    }

    function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingClass) return;

        editForm.put(SchoolClassController.update.url({ schoolClass: editingClass.id }), {
            onSuccess: () => {
                setEditingClass(null);
                editForm.reset();
            },
        });
    }

    function handleDelete(schoolClass: SchoolClass) {
        if (!confirm(`Hapus kelas "${schoolClass.name}"? Semua data terkait akan ikut terhapus.`)) {
            return;
        }

        router.delete(SchoolClassController.destroy.url({ schoolClass: schoolClass.id }));
    }

    return (
        <AdminLayout title="Kelola Kelas">
            <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Generate Kelas</h1>
                    <p className="text-muted-foreground">Admin membuat kelas dan menetapkan wali kelasnya.</p>
                </div>
                <Button asChild variant="secondary">
                    <Link href={admin.dashboard.url()}>Kembali</Link>
                </Button>
            </div>



            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Buat Kelas</CardTitle>
                        <CardDescription>Tambah kelas baru dan tetapkan wali kelas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Kelas</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    placeholder="Kelas 10A"
                                    aria-invalid={Boolean(errors.name)}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher_id">Wali Kelas</Label>
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
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.teacher_id && (
                                    <p className="text-sm text-destructive">{errors.teacher_id}</p>
                                )}
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Kelas'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Kelas Terdaftar</CardTitle>
                        <CardDescription>Edit atau hapus kelas sesuai kebutuhan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {classes.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada kelas dibuat.</p>
                        ) : (
                            classes.data.map((schoolClass) => (
                                <div key={schoolClass.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                                    <div>
                                        <p className="font-medium text-foreground">{schoolClass.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Wali Kelas: {schoolClass.homeroom_teacher?.name ?? '-'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEdit(schoolClass)}
                                            aria-label="Edit kelas"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(schoolClass)}
                                            aria-label="Hapus kelas"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Kelas</CardTitle>
                    <CardDescription>Semua kelas yang sudah digenerate admin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {classes.data.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada kelas.</p>
                    ) : (
                        classes.data.map((schoolClass) => (
                            <div key={schoolClass.id} className="grid gap-2 rounded-lg border border-border p-4 md:grid-cols-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nama</p>
                                    <p className="font-medium">{schoolClass.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Wali Kelas</p>
                                    <p className="font-medium">{schoolClass.homeroom_teacher?.name ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tahun Ajaran</p>
                                    <p className="font-medium">{schoolClass.academic_year ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Siswa</p>
                                    <p className="font-medium">{schoolClass.students_count}</p>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
            </div>

            {/* Edit dialog */}
            <Dialog open={editingClass !== null} onOpenChange={(open) => {
                if (!open) {
                    setEditingClass(null);
                    editForm.reset();
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Kelas</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Kelas</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                placeholder="Kelas 10A"
                                aria-invalid={Boolean(editForm.errors.name)}
                            />
                            {editForm.errors.name && (
                                <p className="text-sm text-destructive">{editForm.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-teacher">Wali Kelas</Label>
                            <Select
                                value={editForm.data.homeroom_teacher_id}
                                onValueChange={(value) => editForm.setData('homeroom_teacher_id', value)}
                            >
                                <SelectTrigger className="w-full" id="edit-teacher">
                                    <SelectValue placeholder="Pilih Guru" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editForm.errors.homeroom_teacher_id && (
                                <p className="text-sm text-destructive">{editForm.errors.homeroom_teacher_id}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                setEditingClass(null);
                                editForm.reset();
                            }}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
