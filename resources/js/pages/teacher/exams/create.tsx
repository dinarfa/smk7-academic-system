import { Form, Head } from '@inertiajs/react';
import ExamController from '@/actions/App/Http/Controllers/Teacher/ExamController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

type Subject = {
    id: number;
    name: string;
    class_id: number;
};

type Class = {
    id: number;
    name: string;
    code: string | null;
};

type Props = {
    subjects: Subject[][];
    classes: Class[];
};

export default function TeacherExamsCreate({ subjects, classes }: Props) {
    const subjectsMap = new Map<number, Subject[]>();
    subjects.forEach((subjectGroup) => {
        if (subjectGroup.length > 0) {
            const classId = subjectGroup[0].class_id;
            subjectsMap.set(classId, subjectGroup);
        }
    });

    return (
        <>
            <Head title="Buat Ujian" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Buat Ujian Baru
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Isi formulir di bawah untuk membuat ujian baru.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Ujian</CardTitle>
                        <CardDescription>
                            Masukkan detail ujian yang ingin dibuat.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...ExamController.store.form()}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">
                                            Judul Ujian
                                        </Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            required
                                            maxLength={255}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-600">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="class_id">Kelas</Label>
                                        <select
                                            id="class_id"
                                            name="class_id"
                                            required
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
                                        >
                                            <option value="">
                                                Pilih Kelas
                                            </option>
                                            {classes.map((cls) => (
                                                <option
                                                    key={cls.id}
                                                    value={cls.id}
                                                >
                                                    {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.class_id && (
                                            <p className="text-sm text-red-600">
                                                {errors.class_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="subject_id">
                                            Mata Pelajaran
                                        </Label>
                                        <select
                                            id="subject_id"
                                            name="subject_id"
                                            required
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
                                        >
                                            <option value="">
                                                Pilih Mata Pelajaran
                                            </option>
                                            {Array.from(
                                                subjectsMap.values()
                                            ).map((subjectGroup) =>
                                                subjectGroup.map(
                                                    (subject) => (
                                                        <option
                                                            key={subject.id}
                                                            value={subject.id}
                                                        >
                                                            {subject.name}
                                                        </option>
                                                    )
                                                )
                                            )}
                                        </select>
                                        {errors.subject_id && (
                                            <p className="text-sm text-red-600">
                                                {errors.subject_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="duration_minutes">
                                            Durasi (menit)
                                        </Label>
                                        <Input
                                            id="duration_minutes"
                                            name="duration_minutes"
                                            type="number"
                                            min={5}
                                            max={480}
                                            required
                                        />
                                        {errors.duration_minutes && (
                                            <p className="text-sm text-red-600">
                                                {errors.duration_minutes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="instructions">
                                            Petunjuk (Opsional)
                                        </Label>
                                        <textarea
                                            id="instructions"
                                            name="instructions"
                                            maxLength={2000}
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
                                        />
                                        {errors.instructions && (
                                            <p className="text-sm text-red-600">
                                                {errors.instructions}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Buat Ujian
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TeacherExamsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'Ujian',
            href: ExamController.index.url(),
        },
        {
            title: 'Buat Ujian',
            href: ExamController.create.url(),
        },
    ],
};
