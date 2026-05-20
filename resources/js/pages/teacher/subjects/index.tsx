import { Head } from '@inertiajs/react'
import { dashboard } from '@/routes'

import {
    BookOpen,
    GraduationCap,
    Layers3,
} from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

type Subject = {
    id: number
    code: string | null
    name: string
    class: string | null
}

type Props = {
    subjects: Subject[]
}

export default function TeacherSubjectsIndex({ subjects }: Props) {
    return (
        <>
            <Head title="Mata Pelajaran" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
                <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                                Dashboard Guru
                            </p>

                            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                                Mata Pelajaran
                            </h1>

                            <p className="mt-1.5 text-slate-500">
                                Daftar mata pelajaran yang Anda ampu.
                            </p>
                        </div>

                        {subjects.length > 0 && (
                            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">

                                <div className="flex items-center gap-2 text-slate-700">
                                    <BookOpen className="h-4 w-4 text-indigo-500" />

                                    <span className="text-sm font-medium">
                                        <span className="text-lg font-bold text-indigo-600">
                                            {subjects.length}
                                        </span>{' '}
                                        Mata Pelajaran
                                    </span>
                                </div>

                                <div className="h-5 w-px bg-slate-200" />

                                <div className="flex items-center gap-2 text-slate-700">
                                    <GraduationCap className="h-4 w-4 text-emerald-500" />

                                    <span className="text-sm font-medium">
                                        Guru Pengampu
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Subject Table ── */}
                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Layers3 className="h-4 w-4 text-indigo-500" />

                            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                                Daftar Mata Pelajaran
                            </h2>
                        </div>

                        {subjects.length > 0 ? (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                {/* Header */}
                                <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">
                                                Mata Pelajaran Anda
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Semua mata pelajaran yang telah ditetapkan oleh admin.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-indigo-100 bg-white px-4 py-2 shadow-sm">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Total Mapel
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-indigo-500" />

                                                <span className="text-xl font-bold text-slate-800">
                                                    {subjects.length}
                                                </span>
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
                                                Mata Pelajaran
                                            </TableHead>

                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Kode
                                            </TableHead>

                                            <TableHead className="pr-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Kelas
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {subjects.map((subject, index) => (
                                            <TableRow
                                                key={subject.id}
                                                className="transition-colors hover:bg-indigo-50/40"
                                            >

                                                {/* Number */}
                                                <TableCell className="pl-5 text-sm text-slate-400">
                                                    {index + 1}
                                                </TableCell>

                                                {/* Subject */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-100">
                                                            <BookOpen className="h-5 w-5 text-indigo-600" />
                                                        </div>

                                                        <div>
                                                            <p className="font-medium text-slate-800">
                                                                {subject.name}
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                Mata pelajaran aktif
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Code */}
                                                <TableCell>
                                                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                                                        {subject.code ?? '—'}
                                                    </span>
                                                </TableCell>

                                                {/* Class */}
                                                <TableCell className="pr-5">
                                                    {subject.class ? (
                                                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                                                            {subject.class}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 py-16 text-center">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                                    <BookOpen className="h-6 w-6 text-indigo-400" />
                                </div>

                                <div>
                                    <p className="font-semibold text-slate-700">
                                        Belum ada mata pelajaran
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Mata pelajaran belum ditetapkan oleh admin.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    )
}

TeacherSubjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Mata Pelajaran', href: '#' },
    ],
}
