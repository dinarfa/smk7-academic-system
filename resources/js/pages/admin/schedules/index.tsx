import { useForm } from '@inertiajs/react'
import { Pencil, Trash2, Plus, Clock, CalendarDays } from 'lucide-react'
import { useState } from 'react'
import AdminSubjectScheduleController from '@/actions/App/Http/Controllers/Admin/SubjectScheduleController'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import AdminLayout from '@/layouts/AdminLayout'

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const SCHOOL_DAYS = [1, 2, 3, 4, 5, 6] // Mon–Sat

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
    morning: 'Pagi (Masuk)',
    subject: 'Mata Pelajaran',
    dismissal: 'Pulang',
}

const SCHEDULE_TYPE_COLORS: Record<string, string> = {
    morning: 'bg-amber-500/15 text-amber-700 border-amber-400/30 dark:text-amber-300',
    subject: 'bg-blue-500/15 text-blue-700 border-blue-400/30 dark:text-blue-300',
    dismissal: 'bg-emerald-500/15 text-emerald-700 border-emerald-400/30 dark:text-emerald-300',
}

type SchoolClass = { id: number; name: string }
type Subject = { id: number; name: string; school_class_id: number | null }
type Schedule = {
    id: number
    school_class_id: number
    school_class_name: string | null
    subject_id: number | null
    subject_name: string | null
    schedule_type: 'morning' | 'subject' | 'dismissal'
    day_of_week: number
    starts_at: string
    ends_at: string
}

type Props = {
    classes: SchoolClass[]
    subjects: Subject[]
    schedules: Schedule[]
}

type CreateForm = {
    school_class_id: string
    subject_id: string
    schedule_type: string
    day_of_week: string
    starts_at: string
    ends_at: string
}

export default function AdminSchedulesIndex({ classes, subjects, schedules }: Props) {
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
    const [selectedClass, setSelectedClass] = useState<string>('all')

    const createForm = useForm<CreateForm>({
        school_class_id: '',
        subject_id: '',
        schedule_type: '',
        day_of_week: '',
        starts_at: '',
        ends_at: '',
    })

    const editForm = useForm<CreateForm>({
        school_class_id: '',
        subject_id: '',
        schedule_type: '',
        day_of_week: '',
        starts_at: '',
        ends_at: '',
    })

    function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        createForm.post(AdminSubjectScheduleController.store.url(), {
            onSuccess: () => createForm.reset(),
        })
    }

    function openEdit(schedule: Schedule) {
        setEditingSchedule(schedule)
        editForm.setData({
            school_class_id: String(schedule.school_class_id),
            subject_id: schedule.subject_id ? String(schedule.subject_id) : '',
            schedule_type: schedule.schedule_type,
            day_of_week: String(schedule.day_of_week),
            starts_at: schedule.starts_at,
            ends_at: schedule.ends_at,
        })
    }

    function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!editingSchedule) {
            return
        }

        editForm.put(AdminSubjectScheduleController.update.url({ subjectSchedule: editingSchedule.id }), {
            onSuccess: () => setEditingSchedule(null),
        })
    }

    function handleDelete(schedule: Schedule) {
        if (!confirm(`Hapus jadwal ${schedule.starts_at}–${schedule.ends_at} pada ${DAY_NAMES[schedule.day_of_week]}?`)) {
            return
        }

        editForm.delete(AdminSubjectScheduleController.destroy.url({ subjectSchedule: schedule.id }))
    }

    // Subjects filtered to the currently selected class in the create form
    const filteredSubjectsForCreate = subjects.filter(
        (s) => !createForm.data.school_class_id || String(s.school_class_id) === createForm.data.school_class_id,
    )

    // Subjects filtered for edit form
    const filteredSubjectsForEdit = subjects.filter(
        (s) => !editForm.data.school_class_id || String(s.school_class_id) === editForm.data.school_class_id,
    )

    // Filter schedules by the selected class
    const filteredSchedules = selectedClass === 'all'
        ? schedules
        : schedules.filter((s) => String(s.school_class_id) === selectedClass)

    return (
        <AdminLayout title="Jadwal Pelajaran">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Jadwal Pelajaran</h1>
                    <p className="mt-1 text-muted-foreground">
                        Atur jadwal harian setiap kelas — sesi pagi, mata pelajaran, dan pulang. Jadwal ini
                        digunakan otomatis saat guru membuka QR absensi.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
                    {/* ── Create form ── */}
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Slot Jadwal
                            </CardTitle>
                            <CardDescription>
                                Tentukan kelas, hari, tipe, dan rentang waktu slot.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-4">
                                {/* Class */}
                                <div className="space-y-2">
                                    <Label htmlFor="create-class">Kelas</Label>
                                    <Select
                                        value={createForm.data.school_class_id}
                                        onValueChange={(v) => {
                                            createForm.setData('school_class_id', v)
                                            createForm.setData('subject_id', '')
                                        }}
                                    >
                                        <SelectTrigger id="create-class" className="w-full">
                                            <SelectValue placeholder="Pilih Kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.school_class_id && (
                                        <p className="text-sm text-destructive">{createForm.errors.school_class_id}</p>
                                    )}
                                </div>

                                {/* Schedule type */}
                                <div className="space-y-2">
                                    <Label htmlFor="create-type">Tipe Sesi</Label>
                                    <Select
                                        value={createForm.data.schedule_type}
                                        onValueChange={(v) => {
                                            createForm.setData('schedule_type', v)

                                            if (v !== 'subject') {
                                                createForm.setData('subject_id', '')
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="create-type" className="w-full">
                                            <SelectValue placeholder="Pilih Tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="morning">Pagi (Masuk)</SelectItem>
                                            <SelectItem value="subject">Mata Pelajaran</SelectItem>
                                            <SelectItem value="dismissal">Pulang</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.schedule_type && (
                                        <p className="text-sm text-destructive">{createForm.errors.schedule_type}</p>
                                    )}
                                </div>

                                {/* Subject — only when type = subject */}
                                {createForm.data.schedule_type === 'subject' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="create-subject">Mata Pelajaran</Label>
                                        <Select
                                            value={createForm.data.subject_id}
                                            onValueChange={(v) => createForm.setData('subject_id', v)}
                                        >
                                            <SelectTrigger id="create-subject" className="w-full">
                                                <SelectValue placeholder="Pilih Mapel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredSubjectsForCreate.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {createForm.errors.subject_id && (
                                            <p className="text-sm text-destructive">{createForm.errors.subject_id}</p>
                                        )}
                                    </div>
                                )}

                                {/* Day of week */}
                                <div className="space-y-2">
                                    <Label htmlFor="create-day">Hari</Label>
                                    <Select
                                        value={createForm.data.day_of_week}
                                        onValueChange={(v) => createForm.setData('day_of_week', v)}
                                    >
                                        <SelectTrigger id="create-day" className="w-full">
                                            <SelectValue placeholder="Pilih Hari" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SCHOOL_DAYS.map((d) => (
                                                <SelectItem key={d} value={String(d)}>
                                                    {DAY_NAMES[d]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.day_of_week && (
                                        <p className="text-sm text-destructive">{createForm.errors.day_of_week}</p>
                                    )}
                                </div>

                                {/* Time range */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-starts">Mulai</Label>
                                        <Input
                                            id="create-starts"
                                            type="time"
                                            value={createForm.data.starts_at}
                                            onChange={(e) => createForm.setData('starts_at', e.target.value)}
                                            aria-invalid={Boolean(createForm.errors.starts_at)}
                                        />
                                        {createForm.errors.starts_at && (
                                            <p className="text-sm text-destructive">{createForm.errors.starts_at}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-ends">Selesai</Label>
                                        <Input
                                            id="create-ends"
                                            type="time"
                                            value={createForm.data.ends_at}
                                            onChange={(e) => createForm.setData('ends_at', e.target.value)}
                                            aria-invalid={Boolean(createForm.errors.ends_at)}
                                        />
                                        {createForm.errors.ends_at && (
                                            <p className="text-sm text-destructive">{createForm.errors.ends_at}</p>
                                        )}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={createForm.processing}>
                                    {createForm.processing ? 'Menyimpan...' : 'Tambah Slot'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* ── Schedule list ── */}
                    <div className="space-y-4">
                        {/* Class filter */}
                        <div className="flex items-center gap-3">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Semua Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kelas</SelectItem>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">
                                {filteredSchedules.length} slot terdaftar
                            </span>
                        </div>

                        {/* Group by day */}
                        {filteredSchedules.length === 0 ? (
                            <Card className="border-dashed border-border/60">
                                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                    Belum ada jadwal. Tambahkan slot dari panel kiri.
                                </CardContent>
                            </Card>
                        ) : (
                            SCHOOL_DAYS.map((day) => {
                                const daySlots = filteredSchedules.filter((s) => s.day_of_week === day)

                                if (daySlots.length === 0) {
                                    return null
                                }

                                return (
                                    <Card key={day} className="border-border/60 shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">{DAY_NAMES[day]}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {daySlots.map((slot) => (
                                                <div
                                                    key={slot.id}
                                                    className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${SCHEDULE_TYPE_COLORS[slot.schedule_type] ?? ''}`}>
                                                                    {SCHEDULE_TYPE_LABELS[slot.schedule_type] ?? slot.schedule_type}
                                                                </span>
                                                                {slot.subject_name && (
                                                                    <span className="text-sm font-medium text-foreground">
                                                                        {slot.subject_name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {slot.school_class_name} · {slot.starts_at} – {slot.ends_at}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => openEdit(slot)}
                                                            aria-label="Edit jadwal"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(slot)}
                                                            aria-label="Hapus jadwal"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Edit dialog */}
            <Dialog open={editingSchedule !== null} onOpenChange={(open) => {
                if (!open) {
                    setEditingSchedule(null)
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Slot Jadwal</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        {/* Class */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-class">Kelas</Label>
                            <Select
                                value={editForm.data.school_class_id}
                                onValueChange={(v) => {
                                    editForm.setData('school_class_id', v)
                                    editForm.setData('subject_id', '')
                                }}
                            >
                                <SelectTrigger id="edit-class" className="w-full">
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Schedule type */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Tipe Sesi</Label>
                            <Select
                                value={editForm.data.schedule_type}
                                onValueChange={(v) => {
                                    editForm.setData('schedule_type', v)

                                    if (v !== 'subject') {
                                        editForm.setData('subject_id', '')
                                    }
                                }}
                            >
                                <SelectTrigger id="edit-type" className="w-full">
                                    <SelectValue placeholder="Pilih Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Pagi (Masuk)</SelectItem>
                                    <SelectItem value="subject">Mata Pelajaran</SelectItem>
                                    <SelectItem value="dismissal">Pulang</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {editForm.data.schedule_type === 'subject' && (
                            <div className="space-y-2">
                                <Label htmlFor="edit-subject">Mata Pelajaran</Label>
                                <Select
                                    value={editForm.data.subject_id}
                                    onValueChange={(v) => editForm.setData('subject_id', v)}
                                >
                                    <SelectTrigger id="edit-subject" className="w-full">
                                        <SelectValue placeholder="Pilih Mapel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSubjectsForEdit.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Day */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-day">Hari</Label>
                            <Select
                                value={editForm.data.day_of_week}
                                onValueChange={(v) => editForm.setData('day_of_week', v)}
                            >
                                <SelectTrigger id="edit-day" className="w-full">
                                    <SelectValue placeholder="Pilih Hari" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SCHOOL_DAYS.map((d) => (
                                        <SelectItem key={d} value={String(d)}>{DAY_NAMES[d]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit-starts">Mulai</Label>
                                <Input
                                    id="edit-starts"
                                    type="time"
                                    value={editForm.data.starts_at}
                                    onChange={(e) => editForm.setData('starts_at', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-ends">Selesai</Label>
                                <Input
                                    id="edit-ends"
                                    type="time"
                                    value={editForm.data.ends_at}
                                    onChange={(e) => editForm.setData('ends_at', e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingSchedule(null)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
