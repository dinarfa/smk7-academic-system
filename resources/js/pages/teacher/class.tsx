import { Head } from '@inertiajs/react';
import { BookOpen, Users } from 'lucide-react';
import SchoolClassController from '@/actions/App/Http/Controllers/Teacher/SchoolClassController';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    const totalStudents = schoolClasses.reduce(
        (sum, c) => sum + c.students_count,
        0,
    );

    return (
        <>
            <Head title="Kelas Wali" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* ── Page Header ── */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Kelas Wali
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola dan lihat informasi kelas perwalian Anda.
                    </p>
                </div>

                {/* ── Kelas Perwalian ── */}
                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        Kelas Perwalian
                    </h2>

                    {schoolClasses.length > 0 ? (
                        <div className="space-y-6">
                            {schoolClasses.map((schoolClass) => (
                                <div
                                    key={schoolClass.id}
                                    className="overflow-hidden rounded-lg border border-border bg-card"
                                >
                                    {/* Header Card */}
                                    <div className="border-b border-border bg-muted/30 px-6 py-4">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        {schoolClass.name}
                                                    </h3>

                                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                                        {schoolClass.code ??
                                                            '—'}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {schoolClass.academic_year ??
                                                        'Tahun ajaran belum diset'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg border border-border px-4 py-3">
                                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Wali Kelas
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-foreground">
                                                        {schoolClass
                                                            .homeroom_teacher
                                                            .name ?? '-'}
                                                    </p>
                                                </div>

                                                <div className="rounded-lg border border-border px-4 py-3">
                                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Jumlah Siswa
                                                    </p>

                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />

                                                        <span className="text-lg font-semibold text-foreground">
                                                            {
                                                                schoolClass.students_count
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16 pl-5">
                                                    #
                                                </TableHead>

                                                <TableHead>
                                                    Nama Siswa
                                                </TableHead>

                                                <TableHead className="pr-5">
                                                    Email
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {schoolClass.students.length ===
                                            0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        className="py-12 text-center"
                                                    >
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                                                <Users className="h-5 w-5 text-muted-foreground" />
                                                            </div>

                                                            <div>
                                                                <p className="font-medium text-foreground">
                                                                    Belum ada
                                                                    siswa
                                                                </p>

                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                    Tidak ada
                                                                    siswa di
                                                                    kelas ini.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                schoolClass.students.map(
                                                    (student, index) => (
                                                        <TableRow
                                                            key={student.id}
                                                        >
                                                            {/* Number */}
                                                            <TableCell className="pl-5 text-sm text-muted-foreground">
                                                                {index + 1}
                                                            </TableCell>

                                                            {/* Student */}
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                                                        {student.name
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>

                                                                    <div>
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                student.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>

                                                            {/* Email */}
                                                            <TableCell className="pr-5 text-sm text-muted-foreground">
                                                                {student.email}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium text-foreground">
                                    Belum ada kelas perwalian
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Kelas belum digenerate oleh admin.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
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
