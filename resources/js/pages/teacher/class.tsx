import { Head } from '@inertiajs/react';
import SchoolClassController from '@/actions/App/Http/Controllers/Teacher/SchoolClassController';
import { dashboard } from '@/routes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
    BookOpen,
    Users,
} from 'lucide-react';

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
        0
    );

    return (
        <>
            <Head title="Kelas Wali" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
                <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                                Dashboard Guru
                            </p>

                            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                                Kelas Wali
                            </h1>

                            <p className="mt-1.5 text-slate-500">
                                Kelola dan lihat informasi kelas perwalian Anda.
                            </p>
                        </div>

                        {schoolClasses.length > 0 && (
                            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <BookOpen className="h-4 w-4 text-indigo-500" />

                                    <span className="text-sm font-medium">
                                        <span className="text-lg font-bold text-indigo-600">
                                            {schoolClasses.length}
                                        </span>{' '}
                                        Kelas
                                    </span>
                                </div>

                                <div className="h-5 w-px bg-slate-200" />

                                <div className="flex items-center gap-2 text-slate-700">
                                    <Users className="h-4 w-4 text-emerald-500" />

                                    <span className="text-sm font-medium">
                                        <span className="text-lg font-bold text-emerald-600">
                                            {totalStudents}
                                        </span>{' '}
                                        Siswa
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Kelas Perwalian ── */}
                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-indigo-500" />

                            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                                Kelas Perwalian
                            </h2>
                        </div>

                        {schoolClasses.length > 0 ? (
                            <div className="space-y-6">

                                {schoolClasses.map((schoolClass) => (
                                    <div
                                        key={schoolClass.id}
                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                    >

                                        {/* Header Card */}
                                        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-5">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-bold text-slate-800">
                                                            {schoolClass.name}
                                                        </h3>

                                                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
                                                            {schoolClass.code ?? '—'}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {schoolClass.academic_year ?? 'Tahun ajaran belum diset'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">

                                                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Wali Kelas
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                                            {schoolClass.homeroom_teacher.name ?? '-'}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Jumlah Siswa
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-emerald-500" />

                                                            <span className="text-lg font-bold text-slate-800">
                                                                {schoolClass.students_count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                                    <TableHead className="w-16 pl-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                        #
                                                    </TableHead>

                                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                        Nama Siswa
                                                    </TableHead>

                                                    <TableHead className="pr-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                        Email
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                {schoolClass.students.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={3}
                                                            className="py-12 text-center"
                                                        >
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                                                                    <Users className="h-5 w-5 text-slate-400" />
                                                                </div>

                                                                <div>
                                                                    <p className="font-medium text-slate-700">
                                                                        Belum ada siswa
                                                                    </p>

                                                                    <p className="mt-1 text-sm text-slate-400">
                                                                        Tidak ada siswa di kelas ini.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    schoolClass.students.map((student, index) => (
                                                        <TableRow
                                                            key={student.id}
                                                            className="transition-colors hover:bg-indigo-50/40"
                                                        >
                                                            {/* Number */}
                                                            <TableCell className="pl-5 text-sm text-slate-400">
                                                                {index + 1}
                                                            </TableCell>

                                                            {/* Student */}
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                                                                        {student.name.charAt(0).toUpperCase()}
                                                                    </div>

                                                                    <div>
                                                                        <p className="font-medium text-slate-800">
                                                                            {student.name}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>

                                                            {/* Email */}
                                                            <TableCell className="pr-5 text-sm text-slate-500">
                                                                {student.email}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 py-16 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                                    <BookOpen className="h-6 w-6 text-indigo-400" />
                                </div>

                                <div>
                                    <p className="font-semibold text-slate-700">
                                        Belum ada kelas perwalian
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Kelas belum digenerate oleh admin.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
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
