import { Form, Head, Link } from '@inertiajs/react';
import SchoolClassController from '@/actions/App/Http/Controllers/Admin/SchoolClassController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

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
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Generate Kelas</h1>
                    <p className="mt-2 text-gray-600">Admin membuat kelas dan menetapkan wali kelasnya.</p>
                </div>
                <Link
                    href={dashboard()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                    Back to Dashboard
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Buat Kelas Baru</CardTitle>
                    <CardDescription>Pilih wali kelas lalu generate kelas untuk mereka.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...SchoolClassController.store.form()} className="grid gap-4 md:grid-cols-2">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="homeroom_teacher_id">Wali Kelas</Label>
                                    <select
                                        id="homeroom_teacher_id"
                                        name="homeroom_teacher_id"
                                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Pilih guru</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} - {teacher.email}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.homeroom_teacher_id && (
                                        <p className="text-sm text-red-600">{errors.homeroom_teacher_id}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Kelas</Label>
                                    <Input id="name" name="name" placeholder="X IPA 1" required />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="code">Kode Kelas</Label>
                                    <Input id="code" name="code" placeholder="X-IPA-1" />
                                    {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="academic_year">Tahun Ajaran</Label>
                                    <Input id="academic_year" name="academic_year" placeholder="2026/2027" />
                                    {errors.academic_year && (
                                        <p className="text-sm text-red-600">{errors.academic_year}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <Button disabled={processing}>Generate Kelas</Button>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>

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
                            <div key={schoolClass.id} className="grid gap-2 rounded-lg border p-4 md:grid-cols-4">
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
    )
}