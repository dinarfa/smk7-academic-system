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
    schoolClasses: SchoolClass[];
};

export default function TeacherClass({ schoolClasses }: Props) {
    const totalStudents = schoolClasses.reduce((sum, c) => sum + c.students_count, 0);

    return (
        <>
            <Head title="Kelas Wali" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Kelas Wali</h1>
                    <p className="text-muted-foreground">Kelas yang ditetapkan ke Anda sebagai wali kelas.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Kelas Wali</CardTitle>
                        <CardDescription>
                            Kelas yang ditetapkan ke Anda sebagai wali kelas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {schoolClasses.length > 0 ? (
                            <>
                                <div className="mb-4 rounded-lg border p-4">
                                    <p className="text-sm text-muted-foreground">Total Siswa di Semua Kelas Perwalian</p>
                                    <p className="text-lg font-medium">{totalStudents}</p>
                                </div>
                                {schoolClasses.map((schoolClass) => (
                                    <div key={schoolClass.id} className="mb-6">
                                        <h3 className="mb-3 text-lg font-semibold">{schoolClass.name}</h3>
                                        <div className="grid gap-4 md:grid-cols-3">
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
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Kelas belum digenerate oleh admin.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {schoolClasses.map((schoolClass) => (
                    <Card key={schoolClass.id}>
                        <CardHeader>
                            <CardTitle>Daftar Siswa - {schoolClass.name}</CardTitle>
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
                ))}
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
