import { Head } from '@inertiajs/react';

import { BookOpen, CalendarDays, Clock, GraduationCap } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';

type ScheduleSlot = {
    time: string;
    class: string;
};

type ScheduleDay = {
    day: string;
    slots: ScheduleSlot[];
};

type Subject = {
    id: number;
    code: string | null;
    name: string;
    class: string | null;
    schedule_days?: ScheduleDay[];
};

type Props = {
    subjects: Subject[];
};

export default function TeacherSubjectsIndex({ subjects }: Props) {
    return (
        <>
            <Head title="Mata Pelajaran" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* ── Page Header ── */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Mata Pelajaran
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Daftar mata pelajaran yang Anda ampu beserta jadwal
                        lengkap.
                    </p>
                </div>

                {/* ── Subject Cards ── */}
                {subjects.length > 0 ? (
                    <div className="space-y-6">
                        {subjects.map((subject, index) => (
                            <div
                                key={subject.id}
                                className="overflow-hidden rounded-lg border border-border bg-card"
                            >
                                {/* Card Header */}
                                <div className="border-b border-border bg-muted/30 px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-semibold text-foreground">
                                                    {subject.name}
                                                </h3>

                                                {subject.code && (
                                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                                        {subject.code}
                                                    </span>
                                                )}
                                            </div>

                                            {subject.class && (
                                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                    {subject.class
                                                        .split(', ')
                                                        .map((cls) => (
                                                            <span
                                                                key={cls}
                                                                className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                                                            >
                                                                {cls}
                                                            </span>
                                                        ))}
                                                </div>
                                            )}
                                        </div>

                                        <span className="text-sm text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                    </div>
                                </div>

                                {/* Schedule Table */}
                                {subject.schedule_days &&
                                subject.schedule_days.length > 0 ? (
                                    <div className="px-6 py-4">
                                        <div className="mb-3 flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <h4 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                                Jadwal Mengajar
                                            </h4>
                                        </div>

                                        <div className="overflow-hidden rounded-lg border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-32 pl-4">
                                                            Hari
                                                        </TableHead>

                                                        <TableHead>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3 w-3" />
                                                                Jam
                                                            </div>
                                                        </TableHead>

                                                        <TableHead className="pr-4">
                                                            Kelas
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {subject.schedule_days.map(
                                                        (day) =>
                                                            day.slots.map(
                                                                (
                                                                    slot,
                                                                    slotIdx,
                                                                ) => (
                                                                    <TableRow
                                                                        key={`${day.day}-${slotIdx}`}
                                                                    >
                                                                        {slotIdx ===
                                                                            0 && (
                                                                            <TableCell
                                                                                rowSpan={
                                                                                    day
                                                                                        .slots
                                                                                        .length
                                                                                }
                                                                                className="border-r border-border pl-4 align-top"
                                                                            >
                                                                                <span className="text-sm font-medium text-foreground">
                                                                                    {
                                                                                        day.day
                                                                                    }
                                                                                </span>
                                                                            </TableCell>
                                                                        )}

                                                                        <TableCell>
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {
                                                                                    slot.time
                                                                                }
                                                                            </span>
                                                                        </TableCell>

                                                                        <TableCell className="pr-4">
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {
                                                                                    slot.class
                                                                                }
                                                                            </span>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ),
                                                            ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-6 py-8 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Jadwal belum ditetapkan.
                                        </p>
                                    </div>
                                )}
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
                                Belum ada mata pelajaran
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Mata pelajaran belum ditetapkan oleh admin.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

TeacherSubjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Mata Pelajaran', href: '#' },
    ],
};
