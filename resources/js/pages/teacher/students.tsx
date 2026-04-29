import { Head, Form, Link } from '@inertiajs/react';
import StudentController from '@/actions/App/Http/Controllers/Teacher/StudentController';
import SchoolClassController from '@/actions/App/Http/Controllers/Teacher/SchoolClassController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

type Student = {
    id: number;
    name: string;
    email: string;
    school_class_name: string | null;
    created_at: string | null;
};

type SchoolClass = {
    id: number;
    name: string;
    code: string | null;
    academic_year: string | null;
    students_count: number;
};

type Props = {
    schoolClass: SchoolClass | null;
    students: {
        data: Student[];
    };
};

export default function TeacherStudents({ schoolClass, students }: Props) {
    return (
        <>
            <Head title="Data Siswa" />

            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Kelas Wali</CardTitle>
                        <CardDescription>Kelola kelas yang menjadi tanggung jawab Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {schoolClass ? (
                            <div className="grid gap-2 rounded-lg border p-4 md:grid-cols-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nama Kelas</p>
                                    <p className="font-medium">{schoolClass.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Kode</p>
                                    <p className="font-medium">{schoolClass.code ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tahun Ajaran</p>
                                    <p className="font-medium">{schoolClass.academic_year ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Jumlah Siswa</p>
                                    <p className="font-medium">{schoolClass.students_count}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 rounded-lg border border-dashed p-4">
                                <p className="text-sm text-muted-foreground">
                                    Anda belum memiliki kelas wali. Buat kelas terlebih dahulu sebelum menambahkan siswa.
                                </p>
                                <Button asChild>
                                    <Link href={SchoolClassController.index.url()}>
                                        Buat Kelas
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tambah Siswa</CardTitle>
                        <CardDescription>Buat akun siswa baru.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!schoolClass ? (
                            <p className="text-sm text-muted-foreground">
                                Form siswa akan aktif setelah kelas wali dibuat.
                            </p>
                        ) : (
                            <Form {...StudentController.store.form()} className="grid gap-4 md:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama</Label>
                                        <Input id="name" name="name" required />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" required />
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" name="password" type="password" required />
                                        {errors.password && (
                                            <p className="text-sm text-red-600">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Button disabled={processing}>Simpan Siswa</Button>
                                    </div>
                                </>
                            )}
                            </Form>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Siswa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {students.data.length === 0 && (
                            <p className="text-sm text-muted-foreground">Belum ada data siswa.</p>
                        )}

                        {students.data.map((student) => (
                            <div
                                key={student.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="grid gap-3 md:grid-cols-3">
                                    <Form
                                        {...StudentController.update.form(student.id)}
                                        className="contents"
                                    >
                                        {({ processing }) => (
                                            <>
                                                <Input
                                                    name="name"
                                                    defaultValue={student.name}
                                                    placeholder="Nama siswa"
                                                    required
                                                />
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    defaultValue={student.email}
                                                    placeholder="Email siswa"
                                                    required
                                                />
                                                <div className="md:col-span-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                                    Kelas: {student.school_class_name ?? schoolClass?.name ?? '-'}
                                                </div>
                                                <Input
                                                    name="password"
                                                    type="password"
                                                    placeholder="Password baru (opsional)"
                                                />
                                                <Input
                                                    name="password_confirmation"
                                                    type="password"
                                                    placeholder="Konfirmasi password"
                                                />
                                                <div className="md:col-span-2">
                                                    <Button type="submit" disabled={processing}>
                                                        Update
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </Form>

                                    <Form
                                        {...StudentController.destroy.form(student.id)}
                                        className="flex md:items-end"
                                    >
                                        {({ processing: deleting }) => (
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                disabled={deleting}
                                            >
                                                Hapus
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TeacherStudents.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'Data Siswa',
            href: StudentController.index(),
        },
    ],
};
