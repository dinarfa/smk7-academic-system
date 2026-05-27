import { Head } from '@inertiajs/react'
import { dashboard } from '@/routes'

import { BookOpen, CalendarDays, Clock, GraduationCap } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

type ScheduleSlot = {
    time: string
    class: string
}

type ScheduleDay = {
    day: string
    slots: ScheduleSlot[]
}

type Subject = {
    id: number
    code: string | null
    name: string
    class: string | null
    schedule_days?: ScheduleDay[]
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
                                Daftar mata pelajaran yang Anda ampu beserta jadwal lengkap.
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

                    {/* ── Subject Cards ── */}
                    {subjects.length > 0 ? (
                        <div className="space-y-6">
                            {subjects.map((subject, index) => (
                                <div
                                    key={subject.id}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                >
                                    {/* Card Header */}
                                    <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100">
                                                <BookOpen className="h-5 w-5 text-indigo-600" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-bold text-slate-800">
                                                        {subject.name}
                                                    </h3>

                                                    {subject.code && (
                                                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                                                            {subject.code}
                                                        </span>
                                                    )}
                                                </div>

                                                {subject.class && (
                                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                        {subject.class.split(', ').map((cls) => (
                                                            <span
                                                                key={cls}
                                                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600"
                                                            >
                                                                {cls}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <span className="text-sm font-medium text-slate-400">
                                                #{index + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Schedule Table */}
                                    {subject.schedule_days && subject.schedule_days.length > 0 ? (
                                        <div className="px-6 py-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-indigo-500" />
                                                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                                                    Jadwal Mengajar
                                                </h4>
                                            </div>

                                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                                            <TableHead className="w-32 pl-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                                Hari
                                                            </TableHead>

                                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="h-3 w-3" />
                                                                    Jam
                                                                </div>
                                                            </TableHead>

                                                            <TableHead className="pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                                Kelas
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>

                                                    <TableBody>
                                                        {subject.schedule_days.map((day) =>
                                                            day.slots.map((slot, slotIdx) => (
                                                                <TableRow
                                                                    key={`${day.day}-${slotIdx}`}
                                                                    className="border-b border-slate-50 hover:bg-indigo-50/20"
                                                                >
                                                                    {slotIdx === 0 && (
                                                                        <TableCell
                                                                            rowSpan={day.slots.length}
                                                                            className="border-r border-slate-100 bg-slate-50/50 pl-4 align-top"
                                                                        >
                                                                            <span className="text-sm font-semibold text-slate-700">
                                                                                {day.day}
                                                                            </span>
                                                                        </TableCell>
                                                                    )}

                                                                    <TableCell>
                                                                        <span className="text-sm text-slate-600">
                                                                            {slot.time}
                                                                        </span>
                                                                    </TableCell>

                                                                    <TableCell className="pr-4">
                                                                        <span className="text-sm text-slate-600">
                                                                            {slot.class}
                                                                        </span>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )),
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="px-6 py-8 text-center">
                                            <p className="text-sm text-slate-400">
                                                Jadwal belum ditetapkan.
                                            </p>
                                        </div>
                                    )}
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
                                    Belum ada mata pelajaran
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Mata pelajaran belum ditetapkan oleh admin.
                                </p>
                            </div>
                        </div>
                    )}
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
