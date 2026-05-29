import { Head, useForm } from '@inertiajs/react';
import {
    Pencil,
    Trash2,
    Plus,
    Clock,
    CalendarDays,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import AdminSubjectScheduleController from '@/actions/App/Http/Controllers/Admin/SubjectScheduleController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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

const DAY_NAMES = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
];
const SCHOOL_DAYS = [1, 2, 3, 4, 5, 6]; // Mon-Sat

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
    morning: 'Pagi (Masuk)',
    subject: 'Mata Pelajaran',
    dismissal: 'Pulang',
};

const SCHEDULE_TYPE_COLORS: Record<string, string> = {
    morning: 'bg-amber-100 text-amber-700',
    subject: 'bg-blue-100 text-blue-700',
    dismissal: 'bg-emerald-100 text-emerald-700',
};

type SchoolClass = { id: number; name: string };
type Subject = { id: number; name: string };
type Schedule = {
    id: number;
    school_class_id: number;
    school_class_name: string | null;
    subject_id: number | null;
    subject_name: string | null;
    teacher_name: string | null;
    schedule_type: 'morning' | 'subject' | 'dismissal';
    day_of_week: number;
    starts_at: string;
    ends_at: string;
};

type Props = {
    classes: SchoolClass[];
    subjects: Subject[];
    schedules: Schedule[];
};

type CreateForm = {
    school_class_id: string;
    subject_id: string;
    schedule_type: string;
    day_of_week: string;
    starts_at: string;
    ends_at: string;
};

export default function AdminSchedulesIndex({
    classes,
    subjects,
    schedules,
}: Props) {
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(
        null,
    );
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [selectedDay, setSelectedDay] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const createForm = useForm<CreateForm>({
        school_class_id: '',
        subject_id: '',
        schedule_type: '',
        day_of_week: '',
        starts_at: '',
        ends_at: '',
    });

    const editForm = useForm<CreateForm>({
        school_class_id: '',
        subject_id: '',
        schedule_type: '',
        day_of_week: '',
        starts_at: '',
        ends_at: '',
    });

    function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        createForm.post(AdminSubjectScheduleController.store.url(), {
            onSuccess: () => createForm.reset(),
        });
    }

    function openEdit(schedule: Schedule) {
        setEditingSchedule(schedule);
        editForm.clearErrors();
        editForm.setData({
            school_class_id: String(schedule.school_class_id),
            subject_id: schedule.subject_id ? String(schedule.subject_id) : '',
            schedule_type: schedule.schedule_type,
            day_of_week: String(schedule.day_of_week),
            starts_at: schedule.starts_at.slice(0, 5),
            ends_at: schedule.ends_at.slice(0, 5),
        });
    }

    function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!editingSchedule) {
            return;
        }

        editForm.put(
            AdminSubjectScheduleController.update.url({
                subjectSchedule: editingSchedule.id,
            }),
            {
                onSuccess: () => setEditingSchedule(null),
            },
        );
    }

    function handleDelete(schedule: Schedule) {
        if (
            !confirm(
                `Hapus jadwal ${schedule.starts_at}-${schedule.ends_at} pada ${DAY_NAMES[schedule.day_of_week]}?`,
            )
        ) {
            return;
        }

        editForm.delete(
            AdminSubjectScheduleController.destroy.url({
                subjectSchedule: schedule.id,
            }),
        );
    }

    const filteredSchedules = schedules.filter((s) => {
        if (
            selectedClass !== 'all' &&
            String(s.school_class_id) !== selectedClass
        ) {
            return false;
        }

        if (selectedDay !== 'all' && s.day_of_week !== Number(selectedDay)) {
            return false;
        }

        if (selectedType !== 'all' && s.schedule_type !== selectedType) {
            return false;
        }

        return true;
    });

    return (
        <>
            <Head title="Jadwal Pelajaran" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Jadwal Pelajaran
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Atur jadwal harian kelas. Jadwal ini digunakan otomatis
                        saat guru membuka QR absensi.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Tambah Slot Jadwal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create-class">Kelas</Label>
                                    <Select
                                        value={createForm.data.school_class_id}
                                        onValueChange={(v) => {
                                            createForm.setData(
                                                'school_class_id',
                                                v,
                                            );
                                            createForm.setData(
                                                'subject_id',
                                                '',
                                            );
                                        }}
                                    >
                                        <SelectTrigger
                                            id="create-class"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Pilih Kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={String(c.id)}
                                                >
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.school_class_id && (
                                        <p className="text-xs text-destructive">
                                            {createForm.errors.school_class_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="create-type">
                                        Tipe Sesi
                                    </Label>
                                    <Select
                                        value={createForm.data.schedule_type}
                                        onValueChange={(v) => {
                                            createForm.setData(
                                                'schedule_type',
                                                v,
                                            );

                                            if (v !== 'subject') {
                                                createForm.setData(
                                                    'subject_id',
                                                    '',
                                                );
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            id="create-type"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Pilih Tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="morning">
                                                Pagi (Masuk)
                                            </SelectItem>
                                            <SelectItem value="subject">
                                                Mata Pelajaran
                                            </SelectItem>
                                            <SelectItem value="dismissal">
                                                Pulang
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.schedule_type && (
                                        <p className="text-xs text-destructive">
                                            {createForm.errors.schedule_type}
                                        </p>
                                    )}
                                </div>

                                {createForm.data.schedule_type ===
                                    'subject' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="create-subject">
                                            Mata Pelajaran
                                        </Label>
                                        <Select
                                            value={createForm.data.subject_id}
                                            onValueChange={(v) =>
                                                createForm.setData(
                                                    'subject_id',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="create-subject"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Pilih Mapel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((s) => (
                                                    <SelectItem
                                                        key={s.id}
                                                        value={String(s.id)}
                                                    >
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {createForm.errors.subject_id && (
                                            <p className="text-xs text-destructive">
                                                {createForm.errors.subject_id}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="create-day">Hari</Label>
                                    <Select
                                        value={createForm.data.day_of_week}
                                        onValueChange={(v) =>
                                            createForm.setData('day_of_week', v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="create-day"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Pilih Hari" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SCHOOL_DAYS.map((d) => (
                                                <SelectItem
                                                    key={d}
                                                    value={String(d)}
                                                >
                                                    {DAY_NAMES[d]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.day_of_week && (
                                        <p className="text-xs text-destructive">
                                            {createForm.errors.day_of_week}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-starts">
                                            Mulai
                                        </Label>
                                        <Input
                                            id="create-starts"
                                            type="time"
                                            value={createForm.data.starts_at}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'starts_at',
                                                    e.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                createForm.errors.starts_at,
                                            )}
                                        />
                                        {createForm.errors.starts_at && (
                                            <p className="text-xs text-destructive">
                                                {createForm.errors.starts_at}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-ends">
                                            Selesai
                                        </Label>
                                        <Input
                                            id="create-ends"
                                            type="time"
                                            value={createForm.data.ends_at}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'ends_at',
                                                    e.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                createForm.errors.ends_at,
                                            )}
                                        />
                                        {createForm.errors.ends_at && (
                                            <p className="text-xs text-destructive">
                                                {createForm.errors.ends_at}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={createForm.processing}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {createForm.processing
                                        ? 'Menyimpan...'
                                        : 'Tambah Slot'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                            <Select
                                value={selectedClass}
                                onValueChange={(v) => {
                                    setSelectedClass(v);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Semua Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Kelas
                                    </SelectItem>
                                    {classes.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={selectedDay}
                                onValueChange={(v) => {
                                    setSelectedDay(v);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Semua Hari" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Hari
                                    </SelectItem>
                                    {SCHOOL_DAYS.map((d) => (
                                        <SelectItem key={d} value={String(d)}>
                                            {DAY_NAMES[d]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={selectedType}
                                onValueChange={(v) => {
                                    setSelectedType(v);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Tipe
                                    </SelectItem>
                                    <SelectItem value="morning">
                                        Pagi (Masuk)
                                    </SelectItem>
                                    <SelectItem value="subject">
                                        Mata Pelajaran
                                    </SelectItem>
                                    <SelectItem value="dismissal">
                                        Pulang
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="ml-auto text-sm text-muted-foreground">
                                {filteredSchedules.length} slot
                            </span>
                        </div>

                        {filteredSchedules.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
                                <Calendar className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="text-center text-sm text-muted-foreground">
                                    Belum ada jadwal.
                                    <br />
                                    Tambahkan slot dari panel kiri.
                                </p>
                            </div>
                        ) : (
                            <Card className="flex flex-col">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="border-b border-border text-xs font-medium text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3 pl-6">
                                                        Hari
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Jam
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Kelas
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Tipe Sesi
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Mata Pelajaran
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Guru
                                                    </th>
                                                    <th className="px-4 py-3 pr-6 text-right">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {[...filteredSchedules]
                                                    .sort((a, b) => {
                                                        if (
                                                            a.day_of_week !==
                                                            b.day_of_week
                                                        ) {
                                                            return (
                                                                a.day_of_week -
                                                                b.day_of_week
                                                            );
                                                        }

                                                        return a.starts_at.localeCompare(
                                                            b.starts_at,
                                                        );
                                                    })
                                                    .slice(
                                                        (currentPage - 1) *
                                                            ITEMS_PER_PAGE,
                                                        currentPage *
                                                            ITEMS_PER_PAGE,
                                                    )
                                                    .map((slot) => (
                                                        <tr
                                                            key={slot.id}
                                                            className="hover:bg-muted/50"
                                                        >
                                                            <td className="px-4 py-3 pl-6 font-medium whitespace-nowrap text-foreground">
                                                                {
                                                                    DAY_NAMES[
                                                                        slot
                                                                            .day_of_week
                                                                    ]
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    <span>
                                                                        {slot.starts_at.slice(
                                                                            0,
                                                                            5,
                                                                        )}{' '}
                                                                        -{' '}
                                                                        {slot.ends_at.slice(
                                                                            0,
                                                                            5,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 font-medium whitespace-nowrap text-foreground">
                                                                {
                                                                    slot.school_class_name
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SCHEDULE_TYPE_COLORS[slot.schedule_type] ?? ''}`}
                                                                >
                                                                    {SCHEDULE_TYPE_LABELS[
                                                                        slot
                                                                            .schedule_type
                                                                    ] ??
                                                                        slot.schedule_type}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 font-medium text-foreground">
                                                                {slot.subject_name ||
                                                                    '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-foreground">
                                                                {slot.teacher_name ||
                                                                    '-'}
                                                            </td>
                                                            <td className="px-4 py-3 pr-6 text-right whitespace-nowrap">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() =>
                                                                            openEdit(
                                                                                slot,
                                                                            )
                                                                        }
                                                                        aria-label="Edit jadwal"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                slot,
                                                                            )
                                                                        }
                                                                        aria-label="Hapus jadwal"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {Math.ceil(
                                        filteredSchedules.length /
                                            ITEMS_PER_PAGE,
                                    ) > 1 && (
                                        <div className="flex items-center justify-between border-t border-border px-6 py-4">
                                            <span className="text-xs text-muted-foreground">
                                                Halaman{' '}
                                                <span className="font-medium text-foreground">
                                                    {currentPage}
                                                </span>{' '}
                                                dari{' '}
                                                <span className="font-medium text-foreground">
                                                    {Math.ceil(
                                                        filteredSchedules.length /
                                                            ITEMS_PER_PAGE,
                                                    )}
                                                </span>
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={currentPage === 1}
                                                    onClick={() =>
                                                        setCurrentPage((p) =>
                                                            Math.max(1, p - 1),
                                                        )
                                                    }
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={
                                                        currentPage ===
                                                        Math.ceil(
                                                            filteredSchedules.length /
                                                                ITEMS_PER_PAGE,
                                                        )
                                                    }
                                                    onClick={() =>
                                                        setCurrentPage((p) =>
                                                            Math.min(
                                                                Math.ceil(
                                                                    filteredSchedules.length /
                                                                        ITEMS_PER_PAGE,
                                                                ),
                                                                p + 1,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <Dialog
                    open={editingSchedule !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingSchedule(null);
                        }
                    }}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Slot Jadwal</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEdit} className="mt-2 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-class">Kelas</Label>
                                <Select
                                    value={editForm.data.school_class_id}
                                    onValueChange={(v) => {
                                        editForm.setData('school_class_id', v);
                                        editForm.setData('subject_id', '');
                                    }}
                                >
                                    <SelectTrigger
                                        id="edit-class"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((c) => (
                                            <SelectItem
                                                key={c.id}
                                                value={String(c.id)}
                                            >
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.school_class_id && (
                                    <p className="text-xs text-destructive">
                                        {editForm.errors.school_class_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-type">Tipe Sesi</Label>
                                <Select
                                    value={editForm.data.schedule_type}
                                    onValueChange={(v) => {
                                        editForm.setData('schedule_type', v);

                                        if (v !== 'subject') {
                                            editForm.setData('subject_id', '');
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        id="edit-type"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="morning">
                                            Pagi (Masuk)
                                        </SelectItem>
                                        <SelectItem value="subject">
                                            Mata Pelajaran
                                        </SelectItem>
                                        <SelectItem value="dismissal">
                                            Pulang
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {editForm.errors.schedule_type && (
                                    <p className="text-xs text-destructive">
                                        {editForm.errors.schedule_type}
                                    </p>
                                )}
                            </div>

                            {editForm.data.schedule_type === 'subject' && (
                                <div className="space-y-2">
                                    <Label htmlFor="edit-subject">
                                        Mata Pelajaran
                                    </Label>
                                    <Select
                                        value={editForm.data.subject_id}
                                        onValueChange={(v) =>
                                            editForm.setData('subject_id', v)
                                        }
                                    >
                                        <SelectTrigger
                                            id="edit-subject"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Pilih Mapel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((s) => (
                                                <SelectItem
                                                    key={s.id}
                                                    value={String(s.id)}
                                                >
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editForm.errors.subject_id && (
                                        <p className="text-xs text-destructive">
                                            {editForm.errors.subject_id}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="edit-day">Hari</Label>
                                <Select
                                    value={editForm.data.day_of_week}
                                    onValueChange={(v) =>
                                        editForm.setData('day_of_week', v)
                                    }
                                >
                                    <SelectTrigger
                                        id="edit-day"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Pilih Hari" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SCHOOL_DAYS.map((d) => (
                                            <SelectItem
                                                key={d}
                                                value={String(d)}
                                            >
                                                {DAY_NAMES[d]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.day_of_week && (
                                    <p className="text-xs text-destructive">
                                        {editForm.errors.day_of_week}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-starts">Mulai</Label>
                                    <Input
                                        id="edit-starts"
                                        type="time"
                                        value={editForm.data.starts_at}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'starts_at',
                                                e.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            editForm.errors.starts_at,
                                        )}
                                    />
                                    {editForm.errors.starts_at && (
                                        <p className="text-xs text-destructive">
                                            {editForm.errors.starts_at}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-ends">Selesai</Label>
                                    <Input
                                        id="edit-ends"
                                        type="time"
                                        value={editForm.data.ends_at}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'ends_at',
                                                e.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            editForm.errors.ends_at,
                                        )}
                                    />
                                    {editForm.errors.ends_at && (
                                        <p className="text-xs text-destructive">
                                            {editForm.errors.ends_at}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="mt-6 border-t border-border pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingSchedule(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                >
                                    {editForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

AdminSchedulesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Jadwal Pelajaran', href: admin.schedules.index.url() },
    ],
};
