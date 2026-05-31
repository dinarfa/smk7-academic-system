import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Pencil, Layers, Search } from 'lucide-react';
import { useState } from 'react';
import DepartmentController from '@/actions/App/Http/Controllers/Admin/DepartmentController';
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
import { Textarea } from '@/components/ui/textarea';
import admin from '@/routes/admin';

type Department = {
    id: number;
    name: string;
    code: string;
    description: string | null;
    school_classes_count: number;
    subjects_count: number;
};

type Props = {
    departments: {
        data: Department[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters?: {
        search?: string;
    };
};

export default function AdminDepartmentsIndex({ departments, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');

    function handleSearch() {
        const params: Record<string, string> = {};

        if (search) {
            params.search = search;
        }

        router.get(admin.departments.index.url(), params, {
            preserveState: true,
        });
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
    });

    const [editingDepartment, setEditingDepartment] =
        useState<Department | null>(null);
    const editForm = useForm({
        name: '',
        code: '',
        description: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(DepartmentController.store.url(), {
            onSuccess: () => reset(),
        });
    };

    function openEdit(department: Department) {
        setEditingDepartment(department);
        editForm.setData({
            name: department.name,
            code: department.code,
            description: department.description ?? '',
        });
    }

    function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!editingDepartment) {
            return;
        }

        editForm.put(
            DepartmentController.update.url({
                department: editingDepartment.id,
            }),
            {
                onSuccess: () => {
                    setEditingDepartment(null);
                    editForm.reset();
                },
            },
        );
    }

    function handleDelete(department: Department) {
        if (
            !confirm(
                `Hapus jurusan "${department.code} - ${department.name}"? Kelas dan mapel terkait tidak akan terhapus, tapi relasi jurusan akan dihapus.`,
            )
        ) {
            return;
        }

        router.delete(
            DepartmentController.destroy.url({
                department: department.id,
            }),
        );
    }

    return (
        <>
            <Head title="Kelola Jurusan" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Kelola Jurusan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola program keahlian/jurusan yang ada di sekolah.
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Cari Jurusan
                        </label>
                        <Input
                            placeholder="Nama atau kode jurusan..."
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
                            <CardTitle>Tambah Jurusan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Jurusan</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="Teknik Komputer dan Jaringan"
                                        aria-invalid={Boolean(errors.name)}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Kode</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        value={data.code}
                                        onChange={(event) =>
                                            setData('code', event.target.value)
                                        }
                                        placeholder="TKJ"
                                        aria-invalid={Boolean(errors.code)}
                                    />
                                    {errors.code && (
                                        <p className="text-xs text-destructive">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Deskripsi{' '}
                                        <span className="text-muted-foreground">
                                            (opsional)
                                        </span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Deskripsi singkat tentang jurusan..."
                                        rows={3}
                                        aria-invalid={Boolean(
                                            errors.description,
                                        )}
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Jurusan'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Daftar Jurusan</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {departments.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Layers className="h-10 w-10 text-muted-foreground/50" />
                                    <h3 className="mt-4 text-sm font-medium text-foreground">
                                        Belum Ada Jurusan
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Tambah jurusan baru menggunakan formulir
                                        di sebelah kiri.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {departments.data.map((department) => (
                                        <div
                                            key={department.id}
                                            className="flex items-center justify-between rounded-lg border border-border p-4"
                                        >
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    <span className="mr-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                                        {department.code}
                                                    </span>
                                                    {department.name}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {
                                                        department.school_classes_count
                                                    }{' '}
                                                    kelas &middot;{' '}
                                                    {department.subjects_count}{' '}
                                                    mapel
                                                    {department.description &&
                                                        ` · ${department.description}`}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        openEdit(department)
                                                    }
                                                    aria-label="Edit jurusan"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(department)
                                                    }
                                                    aria-label="Hapus jurusan"
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
                    open={editingDepartment !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingDepartment(null);
                            editForm.reset();
                        }
                    }}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Jurusan</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nama Jurusan</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                    placeholder="Teknik Komputer dan Jaringan"
                                    aria-invalid={Boolean(editForm.errors.name)}
                                />
                                {editForm.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-code">Kode</Label>
                                <Input
                                    id="edit-code"
                                    value={editForm.data.code}
                                    onChange={(e) =>
                                        editForm.setData('code', e.target.value)
                                    }
                                    placeholder="TKJ"
                                    aria-invalid={Boolean(editForm.errors.code)}
                                />
                                {editForm.errors.code && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">
                                    Deskripsi{' '}
                                    <span className="text-muted-foreground">
                                        (opsional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.data.description}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Deskripsi singkat tentang jurusan..."
                                    rows={3}
                                    aria-invalid={Boolean(
                                        editForm.errors.description,
                                    )}
                                />
                                {editForm.errors.description && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.description}
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingDepartment(null);
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

AdminDepartmentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Kelola Jurusan', href: admin.departments.index.url() },
    ],
};
