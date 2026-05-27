import { Link, useForm } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Plus,
} from 'lucide-react'

type Subject = {
    id: number
    code: string
    name: string
    school_classes: { id: number; name: string }[]
    teacher: { id: number; name: string } | null
    created_at: string | null
    updated_at: string | null
}

type SchoolClass = {
    id: number
    name: string
}

type Teacher = {
    id: number
    name: string
    email: string
}

type Props = {
    classes: SchoolClass[]
    teachers: Teacher[]
    subjects: {
        data: Subject[]
        current_page: number
        last_page: number
        prev_page_url: string | null
        next_page_url: string | null
    }
}

export default function AdminSubjectsIndex({ classes, teachers, subjects }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        school_class_ids: [] as string[],
        teacher_id: '',
    })

    const hasPrev = subjects.current_page > 1
    const hasNext = subjects.current_page < subjects.last_page

    function pageUrl(page: number): string {
        const url = new URL(window.location.href)
        url.searchParams.set('page', String(page))
        return url.pathname + url.search
    }

    function toggleClass(classId: string) {
        setData(
            'school_class_ids',
            data.school_class_ids.includes(classId)
                ? data.school_class_ids.filter((id) => id !== classId)
                : [...data.school_class_ids, classId],
        )
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        post(admin.subjects.store.url(), {
            onSuccess: () => reset(),
        })
    }

    return (
        <AdminLayout title="Mata Pelajaran">
            <div className="space-y-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                            Manajemen Mata Pelajaran
                        </p>

                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                            Mata Pelajaran
                        </h1>

                        <p className="mt-1.5 text-slate-500">
                            Buat dan kelola mata pelajaran untuk setiap kelas.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                    {/* ── Create Form ── */}
                    <div className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                                    <Plus className="h-5 w-5 text-indigo-600" />
                                </div>

                                <div>
                                    <p className="font-semibold text-slate-800">Buat Mata Pelajaran</p>
                                    <p className="text-xs text-slate-500">Tambah mata pelajaran baru dengan kode unik.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Kode Mapel
                                    </Label>

                                    <Input
                                        id="code"
                                        name="code"
                                        value={data.code}
                                        onChange={(event) => setData('code', event.target.value)}
                                        placeholder="MTK"
                                        className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
                                        aria-invalid={Boolean(errors.code)}
                                    />

                                    {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Kelas
                                    </Label>

                                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        {classes.map((schoolClass) => (
                                            <label
                                                key={schoolClass.id}
                                                className="flex cursor-pointer items-center gap-2 text-sm"
                                            >
                                                <Checkbox
                                                    checked={data.school_class_ids.includes(String(schoolClass.id))}
                                                    onCheckedChange={() => toggleClass(String(schoolClass.id))}
                                                />
                                                {schoolClass.name}
                                            </label>
                                        ))}
                                    </div>

                                    {errors.school_class_ids && (
                                        <p className="text-xs text-red-500">{errors.school_class_ids}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="teacher_id" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Guru
                                    </Label>

                                    <Select
                                        value={data.teacher_id}
                                        onValueChange={(value) => setData('teacher_id', value)}
                                    >
                                        <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" id="teacher_id">
                                            <SelectValue placeholder="Pilih Guru" />
                                        </SelectTrigger>

                                        <SelectContent className="rounded-xl">
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={String(teacher.id)} className="rounded-lg">
                                                    {teacher.name} ({teacher.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {errors.teacher_id && (
                                        <p className="text-xs text-red-500">{errors.teacher_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Nama Mata Pelajaran
                                    </Label>

                                    <Input
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        placeholder="Matematika"
                                        className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
                                        aria-invalid={Boolean(errors.name)}
                                    />

                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>

                                <Button type="submit" disabled={processing} className="w-full gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700">
                                    <Plus className="h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Mapel'}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* ── Subject Table ── */}
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                                    <BookOpen className="h-5 w-5 text-indigo-600" />
                                </div>

                                <div>
                                    <p className="font-semibold text-slate-800">Mapel Terdaftar</p>
                                    <p className="text-xs text-slate-500">Edit atau hapus mata pelajaran.</p>
                                </div>

                                <div className="ml-auto rounded-xl border border-indigo-100 bg-white px-3 py-1.5 shadow-sm">
                                    <span className="text-lg font-bold text-indigo-600">{subjects.data.length}</span>
                                    <span className="ml-1.5 text-xs text-slate-400">mapel</span>
                                </div>
                            </div>
                        </div>

                        {subjects.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-16 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                    <BookOpen className="h-6 w-6 text-slate-400" />
                                </div>

                                <div>
                                    <p className="font-semibold text-slate-700">Belum ada mata pelajaran</p>
                                    <p className="mt-1 text-sm text-slate-400">Buat mata pelajaran baru di formulir samping.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80">
                                            <TableHead className="w-12 pl-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                #
                                            </TableHead>

                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Mata Pelajaran
                                            </TableHead>

                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Kode
                                            </TableHead>

                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Kelas
                                            </TableHead>

                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Guru
                                            </TableHead>

                                            <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {subjects.data.map((subject, index) => (
                                            <TableRow
                                                key={subject.id}
                                                className="group border-b border-slate-100/50 transition-colors hover:bg-indigo-50/40"
                                            >
                                                {/* Number */}
                                                <TableCell className="pl-6 text-sm text-slate-400">
                                                    {(subjects.current_page - 1) * 10 + index + 1}
                                                </TableCell>

                                                {/* Subject Name */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                                                            <BookOpen className="h-4 w-4 text-indigo-600" />
                                                        </div>

                                                        <span className="font-medium text-slate-800">{subject.name}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Code */}
                                                <TableCell>
                                                    <Badge variant="outline" className="rounded-full border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                                                        {subject.code}
                                                    </Badge>
                                                </TableCell>

                                                {/* Classes */}
                                                <TableCell>
                                                    {subject.school_classes.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {subject.school_classes.map((c) => (
                                                                <Badge
                                                                    key={c.id}
                                                                    variant="outline"
                                                                    className="rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600"
                                                                >
                                                                    {c.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </TableCell>

                                                {/* Teacher */}
                                                <TableCell>
                                                    {subject.teacher ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-600">
                                                                {subject.teacher.name.charAt(0).toUpperCase()}
                                                            </div>

                                                            <span className="text-sm text-slate-600">{subject.teacher.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="pr-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end" className="w-36 rounded-xl border-slate-200">
                                                            <DropdownMenuItem asChild className="rounded-lg text-sm">
                                                                <Link href={admin.subjects.edit.url({ subject: subject.id })} className="w-full cursor-pointer">
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator className="bg-slate-100" />

                                                            <DropdownMenuItem asChild className="rounded-lg text-sm text-red-600 focus:text-red-700 focus:bg-red-50">
                                                                <Link
                                                                    href={admin.subjects.destroy.url({ subject: subject.id })}
                                                                    method="delete"
                                                                    as="button"
                                                                    className="w-full cursor-pointer"
                                                                >
                                                                    Hapus
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {subjects.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                                        <p className="text-xs text-slate-400">
                                            Halaman <span className="font-semibold text-slate-600">{subjects.current_page}</span> dari{' '}
                                            <span className="font-semibold text-slate-600">{subjects.last_page}</span>
                                        </p>

                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!hasPrev} asChild={hasPrev}>
                                                {hasPrev ? <Link href={pageUrl(1)}><ChevronsLeft className="h-4 w-4" /></Link> : <span><ChevronsLeft className="h-4 w-4" /></span>}
                                            </Button>

                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!hasPrev} asChild={hasPrev}>
                                                {hasPrev ? <Link href={subjects.prev_page_url!}><ChevronLeft className="h-4 w-4" /></Link> : <span><ChevronLeft className="h-4 w-4" /></span>}
                                            </Button>

                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!hasNext} asChild={hasNext}>
                                                {hasNext ? <Link href={subjects.next_page_url!}><ChevronRight className="h-4 w-4" /></Link> : <span><ChevronRight className="h-4 w-4" /></span>}
                                            </Button>

                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!hasNext} asChild={hasNext}>
                                                {hasNext ? <Link href={pageUrl(subjects.last_page)}><ChevronsRight className="h-4 w-4" /></Link> : <span><ChevronsRight className="h-4 w-4" /></span>}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
