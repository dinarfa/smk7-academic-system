import { Head } from '@inertiajs/react';
import SchoolClassController from '@/actions/App/Http/Controllers/Teacher/SchoolClassController';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

type HomeroomStudent = {
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
    homeroom_teacher: {
        id: number | null;
        name: string | null;
        email: string | null;
    };
    students: HomeroomStudent[];
};

type Props = {
    schoolClass: SchoolClass | null;
};

export default function TeacherClass({ schoolClass }: Props) {
    return (
        <>
            <Head title="Kelas Wali" />

            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Kelas Wali</CardTitle>
                        <CardDescription>Kelas ini dibuat oleh admin dan ditetapkan ke Anda sebagai wali kelas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {schoolClass ? (
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="rounded-lg border p-4">
                                    <p className="text-sm text-muted-foreground">Nama Kelas</p>
                                    <p className="text-lg font-medium">{schoolClass.name}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <p className="text-sm text-muted-foreground">Kode</p>
                                    <p className="text-lg font-medium">{schoolClass.code ?? '-'}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <p className="text-sm text-muted-foreground">Tahun Ajaran</p>
                                    <p className="text-lg font-medium">{schoolClass.academic_year ?? '-'}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <p className="text-sm text-muted-foreground">Jumlah Siswa</p>
                                    <p className="text-lg font-medium">{schoolClass.students_count}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Kelas belum digenerate oleh admin.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {schoolClass && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Siswa</CardTitle>
                            <CardDescription>{schoolClass.students_count} siswa terdaftar di kelas ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {schoolClass.students.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada siswa di kelas ini.</p>
                            ) : (
                                schoolClass.students.map((student) => (
                                    <div key={student.id} className="rounded-lg border p-4">
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

TeacherClass.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Guru',
            href: dashboard(),
        },
        {
            title: 'Kelas Wali',
            href: SchoolClassController.index.url(),
        },
    ],
};
