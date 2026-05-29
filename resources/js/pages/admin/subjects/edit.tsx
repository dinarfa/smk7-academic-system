import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

type Subject = {
    id: number;
    code: string;
    name: string;
    school_class_ids: number[];
    teacher_id: number | null;
    class_teachers: Record<number, number | null>;
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
    subject: Subject;
    classes: SchoolClass[];
    teachers: Teacher[];
};

export default function AdminSubjectEdit({
    subject,
    classes,
    teachers,
}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: subject.code,
        name: subject.name,
        school_class_ids: subject.school_class_ids.map(String),
        teacher_id: subject.teacher_id ? String(subject.teacher_id) : '',
        class_teachers: Object.fromEntries(
            Object.entries(subject.class_teachers).map(([classId, teacherId]) => [
                classId,
                teacherId ? String(teacherId) : '',
            ]),
        ),
    });

    function toggleClass(classId: string) {
        const newIds = data.school_class_ids.includes(classId)
            ? data.school_class_ids.filter((id) => id !== classId)
            : [...data.school_class_ids, classId];

        setData('school_class_ids', newIds);

        // If unchecking, remove the class teacher entry
        if (!newIds.includes(classId)) {
            const newClassTeachers = { ...data.class_teachers };
            delete newClassTeachers[classId];
            setData('class_teachers', newClassTeachers);
        }
    }

    function setClassTeacher(classId: string, teacherId: string) {
        setData('class_teachers', {
            ...data.class_teachers,
            [classId]: teacherId,
        });
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        put(admin.subjects.update.url({ subject: subject.id }));
    }

    return (
        <>
            <Head title="Edit Mata Pelajaran" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Edit Mata Pelajaran
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Perbarui kode, nama, dan pengaturan guru per kelas.
                        </p>
                    </div>
                    <Button asChild variant="secondary">
                        <Link href={admin.subjects.index.url()}>Kembali</Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Detail Mata Pelajaran</CardTitle>
                        <CardDescription>
                            Perbarui informasi mata pelajaran.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode Mapel</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    value={data.code}
                                    onChange={(event) =>
                                        setData('code', event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.code)}
                                />
                                {errors.code && (
                                    <p className="text-sm text-destructive">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Mata Pelajaran
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.name)}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher_id">
                                    Guru Default
                                </Label>
                                <Select
                                    value={data.teacher_id}
                                    onValueChange={(value) =>
                                        setData('teacher_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="teacher_id"
                                    >
                                        <SelectValue placeholder="Pilih Guru Default" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((teacher) => (
                                            <SelectItem
                                                key={teacher.id}
                                                value={String(teacher.id)}
                                            >
                                                {teacher.name} ({teacher.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.teacher_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.teacher_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label>Kelas & Guru per Kelas</Label>
                                <p className="text-xs text-muted-foreground">
                                    Centang kelas, lalu pilih guru untuk setiap
                                    kelas. Jika tidak dipilih, guru default yang
                                    berlaku.
                                </p>
                                <div className="space-y-2 rounded-lg border border-border p-3">
                                    {classes.map((schoolClass) => {
                                        const classIdStr = String(
                                            schoolClass.id,
                                        );
                                        const isChecked =
                                            data.school_class_ids.includes(
                                                classIdStr,
                                            );

                                        return (
                                            <div
                                                key={schoolClass.id}
                                                className="flex items-center gap-3"
                                            >
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() =>
                                                        toggleClass(classIdStr)
                                                    }
                                                />
                                                <span className="w-28 shrink-0 text-sm font-medium">
                                                    {schoolClass.name}
                                                </span>
                                                {isChecked && (
                                                    <Select
                                                        value={
                                                            data.class_teachers[
                                                                classIdStr
                                                            ] ?? ''
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setClassTeacher(
                                                                classIdStr,
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 flex-1 text-xs">
                                                            <SelectValue placeholder="Guru default" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {teachers.map(
                                                                (
                                                                    teacher,
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            teacher.id
                                                                        }
                                                                        value={String(
                                                                            teacher.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            teacher.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.school_class_ids && (
                                    <p className="text-sm text-destructive">
                                        {errors.school_class_ids}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={admin.subjects.index.url()}>
                                        Batal
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminSubjectEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Mata Pelajaran', href: admin.subjects.index.url() },
        { title: 'Edit', href: '#' },
    ],
};
