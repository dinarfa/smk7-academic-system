import { useForm } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Clock, CalendarDays, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import AdminSubjectScheduleController from '@/actions/App/Http/Controllers/Admin/SubjectScheduleController';
import { Button } from '@/components/ui/button';
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
import AdminLayout from '@/layouts/AdminLayout';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const SCHOOL_DAYS = [1, 2, 3, 4, 5, 6]; // Mon–Sat

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
    morning: 'Pagi (Masuk)',
    subject: 'Mata Pelajaran',
    dismissal: 'Pulang',
};

const SCHEDULE_TYPE_COLORS: Record<string, string> = {
    morning: 'bg-amber-100 text-amber-700 border-amber-200',
    subject: 'bg-blue-100 text-blue-700 border-blue-200',
    dismissal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
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

export default function AdminSchedulesIndex({ classes, subjects, schedules }: Props) {
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [selectedClass, setSelectedClass] = useState<string>('all');
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
            starts_at: schedule.starts_at,
            ends_at: schedule.ends_at,
        });
    }

    function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!editingSchedule) {
            return;
        }

        editForm.put(AdminSubjectScheduleController.update.url({ subjectSchedule: editingSchedule.id }), {
            onSuccess: () => setEditingSchedule(null),
        });
    }

    function handleDelete(schedule: Schedule) {
        if (!confirm(`Hapus jadwal ${schedule.starts_at}–${schedule.ends_at} pada ${DAY_NAMES[schedule.day_of_week]}?`)) {
            return;
        }

        editForm.delete(AdminSubjectScheduleController.destroy.url({ subjectSchedule: schedule.id }));
    }

    const filteredSubjectsForCreate = subjects;
    const filteredSubjectsForEdit = subjects;

    const filteredSchedules = selectedClass === 'all'
        ? schedules
        : schedules.filter((s) => String(s.school_class_id) === selectedClass);

    return (
        <AdminLayout title="Jadwal Pelajaran">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-8">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                        Manajemen Jadwal
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Jadwal Pelajaran
                    </h1>
                    <p className="mt-1.5 text-slate-500">
                        Atur jadwal harian kelas. Jadwal ini digunakan otomatis saat guru membuka QR absensi.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
                {/* ── Create form ── */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm h-fit">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                                <Plus className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Tambah Slot Jadwal</p>
                                <p className="text-xs text-slate-500">Tentukan kelas, hari, tipe, dan rentang waktu.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleCreate} className="space-y-4">
                            {/* Class */}
                            <div className="space-y-2">
                                <Label htmlFor="create-class" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kelas</Label>
                                <Select
                                    value={createForm.data.school_class_id}
                                    onValueChange={(v) => {
                                        createForm.setData('school_class_id', v);
                                        createForm.setData('subject_id', '');
                                    }}
                                >
                                    <SelectTrigger id="create-class" className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white">
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {classes.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)} className="rounded-lg">
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createForm.errors.school_class_id && (
                                    <p className="text-xs text-red-500">{createForm.errors.school_class_id}</p>
                                )}
                            </div>

                            {/* Schedule type */}
                            <div className="space-y-2">
                                <Label htmlFor="create-type" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipe Sesi</Label>
                                <Select
                                    value={createForm.data.schedule_type}
                                    onValueChange={(v) => {
                                        createForm.setData('schedule_type', v);
                                        if (v !== 'subject') {
                                            createForm.setData('subject_id', '');
                                        }
                                    }}
                                >
                                    <SelectTrigger id="create-type" className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white">
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="morning" className="rounded-lg">Pagi (Masuk)</SelectItem>
                                        <SelectItem value="subject" className="rounded-lg">Mata Pelajaran</SelectItem>
                                        <SelectItem value="dismissal" className="rounded-lg">Pulang</SelectItem>
                                    </SelectContent>
                                </Select>
                                {createForm.errors.schedule_type && (
                                    <p className="text-xs text-red-500">{createForm.errors.schedule_type}</p>
                                )}
                            </div>

                            {/* Subject — only when type = subject */}
                            {createForm.data.schedule_type === 'subject' && (
                                <div className="space-y-2">
                                    <Label htmlFor="create-subject" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mata Pelajaran</Label>
                                    <Select
                                        value={createForm.data.subject_id}
                                        onValueChange={(v) => createForm.setData('subject_id', v)}
                                    >
                                        <SelectTrigger id="create-subject" className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white">
                                            <SelectValue placeholder="Pilih Mapel" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {filteredSubjectsForCreate.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)} className="rounded-lg">
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.subject_id && (
                                        <p className="text-xs text-red-500">{createForm.errors.subject_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Day of week */}
                            <div className="space-y-2">
                                <Label htmlFor="create-day" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hari</Label>
                                <Select
                                    value={createForm.data.day_of_week}
                                    onValueChange={(v) => createForm.setData('day_of_week', v)}
                                >
                                    <SelectTrigger id="create-day" className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white">
                                        <SelectValue placeholder="Pilih Hari" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {SCHOOL_DAYS.map((d) => (
                                            <SelectItem key={d} value={String(d)} className="rounded-lg">
                                                {DAY_NAMES[d]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createForm.errors.day_of_week && (
                                    <p className="text-xs text-red-500">{createForm.errors.day_of_week}</p>
                                )}
                            </div>

                            {/* Time range */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="create-starts" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mulai</Label>
                                    <Input
                                        id="create-starts"
                                        type="time"
                                        value={createForm.data.starts_at}
                                        onChange={(e) => createForm.setData('starts_at', e.target.value)}
                                        className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
                                        aria-invalid={Boolean(createForm.errors.starts_at)}
                                    />
                                    {createForm.errors.starts_at && (
                                        <p className="text-xs text-red-500">{createForm.errors.starts_at}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-ends" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selesai</Label>
                                    <Input
                                        id="create-ends"
                                        type="time"
                                        value={createForm.data.ends_at}
                                        onChange={(e) => createForm.setData('ends_at', e.target.value)}
                                        className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
                                        aria-invalid={Boolean(createForm.errors.ends_at)}
                                    />
                                    {createForm.errors.ends_at && (
                                        <p className="text-xs text-red-500">{createForm.errors.ends_at}</p>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700" disabled={createForm.processing}>
                                <Plus className="h-4 w-4" />
                                {createForm.processing ? 'Menyimpan...' : 'Tambah Slot'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* ── Schedule list ── */}
                <div className="space-y-4">
                    {/* Class filter */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                                <CalendarDays className="h-5 w-5 text-indigo-500" />
                            </div>
                            <Select 
                                value={selectedClass} 
                                onValueChange={(v) => {
                                    setSelectedClass(v);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[180px] rounded-lg border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white">
                                    <SelectValue placeholder="Semua Kelas" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all" className="rounded-lg">Semua Kelas</SelectItem>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)} className="rounded-lg">
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-sm font-medium text-slate-500 mr-2">
                            {filteredSchedules.length} slot
                        </span>
                    </div>

                    {/* Sorted and paginated table */}
                    {filteredSchedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12">
                            <Calendar className="h-10 w-10 text-slate-300 mb-3" />
                            <p className="text-sm text-slate-500 text-center">Belum ada jadwal.<br/>Tambahkan slot dari panel kiri.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-4 py-4 pl-6">Hari</th>
                                            <th className="px-4 py-4">Jam</th>
                                            <th className="px-4 py-4">Kelas</th>
                                            <th className="px-4 py-4">Tipe Sesi</th>
                                            <th className="px-4 py-4">Mata Pelajaran</th>
                                            <th className="px-4 py-4">Guru</th>
                                            <th className="px-4 py-4 pr-6 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[...filteredSchedules]
                                            .sort((a, b) => {
                                                if (a.day_of_week !== b.day_of_week) {
                                                    return a.day_of_week - b.day_of_week;
                                                }
                                                return a.starts_at.localeCompare(b.starts_at);
                                            })
                                            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                            .map((slot) => (
                                            <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-4 pl-6 font-medium text-slate-900 whitespace-nowrap">
                                                    {DAY_NAMES[slot.day_of_week]}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{slot.starts_at.slice(0, 5)} - {slot.ends_at.slice(0, 5)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap font-medium text-indigo-600">
                                                    {slot.school_class_name}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${SCHEDULE_TYPE_COLORS[slot.schedule_type] ?? ''}`}>
                                                        {SCHEDULE_TYPE_LABELS[slot.schedule_type] ?? slot.schedule_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-slate-700">
                                                    {slot.subject_name || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-slate-600">
                                                    {slot.teacher_name || '-'}
                                                </td>
                                                <td className="px-4 py-4 pr-6 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                            onClick={() => openEdit(slot)}
                                                            aria-label="Edit jadwal"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                            onClick={() => handleDelete(slot)}
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
                            
                            {/* Pagination Controls */}
                            {Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE) > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                                    <span className="text-xs text-slate-400">
                                        Halaman <span className="font-semibold text-slate-600">{currentPage}</span> dari <span className="font-semibold text-slate-600">{Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE)}</span>
                                    </span>
                                    <div className="flex gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg" 
                                            disabled={currentPage === 1} 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg" 
                                            disabled={currentPage === Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE)} 
                                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE), p + 1))}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit dialog */}
            <Dialog open={editingSchedule !== null} onOpenChange={(open) => {
                if (!open) {
                    setEditingSchedule(null);
                }
            }}>
                <DialogContent className="max-w-md sm:rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Edit Slot Jadwal</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 mt-2">
                        {/* Class */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-class" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kelas</Label>
                            <Select
                                value={editForm.data.school_class_id}
                                onValueChange={(v) => {
                                    editForm.setData('school_class_id', v);
                                    editForm.setData('subject_id', '');
                                }}
                            >
                                <SelectTrigger id="edit-class" className="w-full rounded-xl border-slate-200">
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)} className="rounded-lg">{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editForm.errors.school_class_id && (
                                <p className="text-xs text-red-500">{editForm.errors.school_class_id}</p>
                            )}
                        </div>

                        {/* Schedule type */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-type" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipe Sesi</Label>
                            <Select
                                value={editForm.data.schedule_type}
                                onValueChange={(v) => {
                                    editForm.setData('schedule_type', v);
                                    if (v !== 'subject') {
                                        editForm.setData('subject_id', '');
                                    }
                                }}
                            >
                                <SelectTrigger id="edit-type" className="w-full rounded-xl border-slate-200">
                                    <SelectValue placeholder="Pilih Tipe" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="morning" className="rounded-lg">Pagi (Masuk)</SelectItem>
                                    <SelectItem value="subject" className="rounded-lg">Mata Pelajaran</SelectItem>
                                    <SelectItem value="dismissal" className="rounded-lg">Pulang</SelectItem>
                                </SelectContent>
                            </Select>
                            {editForm.errors.schedule_type && (
                                <p className="text-xs text-red-500">{editForm.errors.schedule_type}</p>
                            )}
                        </div>

                        {editForm.data.schedule_type === 'subject' && (
                            <div className="space-y-2">
                                <Label htmlFor="edit-subject" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mata Pelajaran</Label>
                                <Select
                                    value={editForm.data.subject_id}
                                    onValueChange={(v) => editForm.setData('subject_id', v)}
                                >
                                    <SelectTrigger id="edit-subject" className="w-full rounded-xl border-slate-200">
                                        <SelectValue placeholder="Pilih Mapel" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {filteredSubjectsForEdit.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)} className="rounded-lg">{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.subject_id && (
                                    <p className="text-xs text-red-500">{editForm.errors.subject_id}</p>
                                )}
                            </div>
                        )}

                        {/* Day */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-day" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hari</Label>
                            <Select
                                value={editForm.data.day_of_week}
                                onValueChange={(v) => editForm.setData('day_of_week', v)}
                            >
                                <SelectTrigger id="edit-day" className="w-full rounded-xl border-slate-200">
                                    <SelectValue placeholder="Pilih Hari" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {SCHOOL_DAYS.map((d) => (
                                        <SelectItem key={d} value={String(d)} className="rounded-lg">{DAY_NAMES[d]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editForm.errors.day_of_week && (
                                <p className="text-xs text-red-500">{editForm.errors.day_of_week}</p>
                            )}
                        </div>

                        {/* Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit-starts" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mulai</Label>
                                <Input
                                    id="edit-starts"
                                    type="time"
                                    value={editForm.data.starts_at}
                                    onChange={(e) => editForm.setData('starts_at', e.target.value)}
                                    className="rounded-xl border-slate-200"
                                    aria-invalid={Boolean(editForm.errors.starts_at)}
                                />
                                {editForm.errors.starts_at && (
                                    <p className="text-xs text-red-500">{editForm.errors.starts_at}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-ends" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selesai</Label>
                                <Input
                                    id="edit-ends"
                                    type="time"
                                    value={editForm.data.ends_at}
                                    onChange={(e) => editForm.setData('ends_at', e.target.value)}
                                    className="rounded-xl border-slate-200"
                                    aria-invalid={Boolean(editForm.errors.ends_at)}
                                />
                                {editForm.errors.ends_at && (
                                    <p className="text-xs text-red-500">{editForm.errors.ends_at}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="mt-6 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditingSchedule(null)}>
                                Batal
                            </Button>
                            <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700" disabled={editForm.processing}>
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
