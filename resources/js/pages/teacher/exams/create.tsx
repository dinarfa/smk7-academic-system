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

import { useMemo, useState } from 'react';

type SubjectGroup = {
    key: string;
    name: string;
    code: string;
    classes: {
        id: number;
        name: string;
        code: string | null;
        subject_id: number;
    }[];
};

type Props = {
    subject_groups: SubjectGroup[];
};

export default function TeacherExamsCreate({ subject_groups: subjectGroups }: Props) {
    const [selectedSubjectKey, setSelectedSubjectKey] = useState('');

    const selectedSubject = useMemo(
        () => subjectGroups.find((group) => group.key === selectedSubjectKey) ?? null,
        [selectedSubjectKey, subjectGroups],
    );

    return (
        <>
            <Head title="Buat Ujian" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">
                        Buat Ujian Baru
                    </h1>
                    <p className="text-muted-foreground">
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
                                        <Label htmlFor="subject_key">Mata Pelajaran</Label>
                                        <select
                                            id="subject_key"
                                            value={selectedSubjectKey}
                                            onChange={(event) => setSelectedSubjectKey(event.target.value)}
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
                                        >
                                            <option value="">Pilih Mata Pelajaran</option>
                                            {subjectGroups.map((group) => (
                                                <option key={group.key} value={group.key}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="class_id">Kelas</Label>
                                        <select
                                            key={selectedSubjectKey || 'no-subject'}
                                            id="class_id"
                                            name="class_id"
                                            defaultValue=""
                                            required
                                            disabled={selectedSubject === null}
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <option value="">Pilih Kelas</option>
                                            {selectedSubject?.classes.map((cls) => (
                                                <option key={cls.id} value={cls.id}>
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
                                        <Label htmlFor="subject_id">Mapel (untuk submit)</Label>
                                        <select
                                            key={selectedSubjectKey || 'no-subject-id'}
                                            id="subject_id"
                                            name="subject_id"
                                            defaultValue=""
                                            required
                                            disabled={selectedSubject === null}
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <option value="">Pilih Mapel di Kelas Terpilih</option>
                                            {selectedSubject?.classes.map((cls) => (
                                                <option key={cls.subject_id} value={cls.subject_id}>
                                                    {selectedSubject.name} - {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.subject_id && (
                                            <p className="text-sm text-red-600">
                                                {errors.subject_id}
                                            </p>
                                        )}
                                    </div>

                                    {subjectGroups.length === 0 && (
                                        <p className="text-sm text-amber-600">
                                            Anda belum punya relasi mata pelajaran-kelas. Hubungi admin.
                                        </p>
                                    )}

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
                                            disabled={processing || subjectGroups.length === 0 || selectedSubject === null}
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
