import { Link, useForm } from '@inertiajs/react';
import SchoolClassController from '@/actions/App/Http/Controllers/Admin/SchoolClassController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <AdminLayout title="Class Management">
            <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Generate Kelas</h1>
                    <p className="mt-2 text-muted-foreground">Admin membuat kelas dan menetapkan wali kelasnya.</p>
                </div>
                <Button asChild variant="secondary">
                    <Link href={admin.dashboard.url()}>Back to Dashboard</Link>
                </Button>
            </div>





            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Class</CardTitle>
                        <CardDescription>Add a new class and assign a homeroom teacher.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Class Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    placeholder="Grade 10A"
                                    aria-invalid={Boolean(errors.name)}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher_id">Homeroom Teacher</Label>
                                <Select
                                    value={data.teacher_id}
                                    onValueChange={(value) => setData('teacher_id', value)}
                                >
                                    <SelectTrigger className="w-full" id="teacher_id">
                                        <SelectValue placeholder="Select Teacher" />
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
                                {processing ? 'Saving...' : 'Save Class'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Classes</CardTitle>
                        <CardDescription>Edit or delete classes as needed.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {classes.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No classes created yet.</p>
                        ) : (
                            classes.data.map((schoolClass) => (
                                <div key={schoolClass.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                                    <div>
                                        <p className="font-medium text-foreground">{schoolClass.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Teacher: {schoolClass.homeroom_teacher?.name ?? '-'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button asChild variant="link" className="h-auto p-0">
                                            <Link href={`/admin/classes/${schoolClass.id}/edit`}>Edit</Link>
                                        </Button>
                                        <Button asChild variant="link" className="h-auto p-0 text-destructive">
                                            <Link href={`/admin/classes/${schoolClass.id}`} method="delete" as="button">
                                                Delete
                                            </Link>
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
        </AdminLayout>
    )
}
