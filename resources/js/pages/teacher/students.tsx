import { Head, Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import SchoolClassController from '@/actions/App/Http/Controllers/Teacher/SchoolClassController';
import StudentController from '@/actions/App/Http/Controllers/Teacher/StudentController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboard } from '@/routes';
import {
    Users,
    BookOpen,
    GraduationCap,
    Plus,
    Pencil,
    Trash2,
    AlertCircle,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

type Student = {
    id: number;
    name: string;
    email: string;
    school_class_name: string | null;
    created_at: string | null;
};

type SchoolClass = {
    id: number;
    name: string;
    code: string | null;
    academic_year: string | null;
    students_count: number;
};

// Laravel paginator shape
type PaginatedStudents = {
    data: Student[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type Props = {
    schoolClasses: SchoolClass[];
    students: PaginatedStudents;
};

export default function TeacherStudents({ schoolClasses, students }: Props) {
    const totalStudents = schoolClasses.reduce((sum, c) => sum + c.students_count, 0);

    const [editTarget, setEditTarget] = useState<Student | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

    // Build a URL for a given page number, preserving existing query params
    function pageUrl(page: number): string {
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));
        return url.pathname + url.search;
    }

    const { current_page, last_page, from, to, total } = students;
    const hasPrev = current_page > 1;
    const hasNext = current_page < last_page;

    return (
        <>
            <Head title="Data Siswa" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
                <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                                Dashboard Guru
                            </p>
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                                Data Siswa
                            </h1>
                            <p className="mt-1.5 text-slate-500">
                                Kelola data siswa di kelas perwalian Anda.
                            </p>
                        </div>

                        {schoolClasses.length > 0 && (
                            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <BookOpen className="h-4 w-4 text-indigo-500" />
                                    <span className="text-sm font-medium">
                                        <span className="text-lg font-bold text-indigo-600">{schoolClasses.length}</span> Kelas
                                    </span>
                                </div>
                                <div className="h-5 w-px bg-slate-200" />
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Users className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-medium">
                                        <span className="text-lg font-bold text-emerald-600">{totalStudents}</span> Siswa
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Kelas Wali ── */}
                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-indigo-500" />
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                                Kelas Perwalian
                            </h2>
                        </div>

                        {schoolClasses.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {schoolClasses.map((sc) => (
                                    <div
                                        key={sc.id}
                                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                                        <div className="mt-1 flex items-start justify-between">
                                            <div>
                                                <p className="text-lg font-bold text-slate-800">{sc.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {sc.academic_year ?? 'Tahun ajaran belum diset'}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                                                {sc.code ?? '—'}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex items-center gap-1.5 text-slate-500">
                                            <Users className="h-3.5 w-3.5" />
                                            <span className="text-sm">
                                                <span className="font-semibold text-slate-700">{sc.students_count}</span> siswa
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 py-12 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                                    <BookOpen className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700">Belum ada kelas wali</p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Buat kelas terlebih dahulu sebelum menambahkan siswa.
                                    </p>
                                </div>
                                <Button asChild className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700">
                                    <Link href={SchoolClassController.index.url()}>
                                        <Plus className="h-4 w-4" /> Buat Kelas
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </section>

                    {/* ── Tambah Siswa ── */}
                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Plus className="h-4 w-4 text-emerald-500" />
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                                Tambah Siswa Baru
                            </h2>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                                        <GraduationCap className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">Buat Akun Siswa</p>
                                        <p className="text-xs text-slate-500">Isi data lengkap untuk mendaftarkan siswa baru.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {schoolClasses.length === 0 ? (
                                    <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        Form siswa akan aktif setelah kelas wali dibuat.
                                    </div>
                                ) : (
                                    <Form {...StudentController.store.form()} className="grid gap-5 sm:grid-cols-2">
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Lengkap</Label>
                                                    <Input id="name" name="name" required placeholder="Contoh: Budi Santoso"
                                                        className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" />
                                                    {errors.name && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
                                                </div>

                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</Label>
                                                    <Input id="email" name="email" type="email" required placeholder="siswa@sekolah.ac.id"
                                                        className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" />
                                                    {errors.email && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
                                                </div>

                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</Label>
                                                    <Input id="password" name="password" type="password" required placeholder="Min. 8 karakter"
                                                        className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" />
                                                    {errors.password && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
                                                </div>

                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="password_confirmation" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Konfirmasi Password</Label>
                                                    <Input id="password_confirmation" name="password_confirmation" type="password" required placeholder="Ulangi password"
                                                        className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" />
                                                </div>

                                                {schoolClasses.length > 1 && (
                                                    <div className="grid gap-1.5">
                                                        <Label htmlFor="school_class_id" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kelas</Label>
                                                        <select id="school_class_id" name="school_class_id"
                                                            className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                                            defaultValue={schoolClasses[0]?.id}>
                                                            {schoolClasses.map((sc) => (
                                                                <option key={sc.id} value={sc.id}>{sc.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                <div className="flex items-end sm:col-span-2">
                                                    <Button disabled={processing} className="gap-2 rounded-xl bg-emerald-600 px-6 hover:bg-emerald-700 disabled:opacity-60">
                                                        <Plus className="h-4 w-4" />
                                                        {processing ? 'Menyimpan...' : 'Simpan Siswa'}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── Daftar Siswa ── */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-500" />
                                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                                    Daftar Siswa
                                </h2>
                            </div>
                            {total > 0 && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                    {total} siswa
                                </span>
                            )}
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            {students.data.length === 0 ? (
                                <div className="flex flex-col items-center gap-4 py-16 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                        <Users className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700">Belum ada data siswa</p>
                                        <p className="mt-1 text-sm text-slate-400">Tambahkan siswa menggunakan form di atas.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                                <TableHead className="w-12 pl-5 text-xs font-semibold uppercase tracking-wider text-slate-400">#</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">Siswa</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kelas</TableHead>
                                                <TableHead className="pr-5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.data.map((student, idx) => (
                                                <TableRow
                                                    key={student.id}
                                                    className="group transition-colors hover:bg-indigo-50/40"
                                                >
                                                    <TableCell className="pl-5 text-sm text-slate-400">
                                                        {(from ?? 1) + idx}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                                                                {student.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-slate-800">{student.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-500">{student.email}</TableCell>
                                                    <TableCell>
                                                        {student.school_class_name ? (
                                                            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                                                                {student.school_class_name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-slate-400">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="pr-5 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                                <DropdownMenuItem
                                                                    className="gap-2 rounded-lg text-sm"
                                                                    onSelect={() => setEditTarget(student)}
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5 text-indigo-500" />
                                                                    Edit Data
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="gap-2 rounded-lg text-sm text-red-500 focus:text-red-600"
                                                                    onSelect={() => setDeleteTarget(student)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Hapus Siswa
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* ── Pagination ── */}
                                    {last_page > 1 && (
                                        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                                            {/* Info */}
                                            <p className="text-xs text-slate-400">
                                                Menampilkan{' '}
                                                <span className="font-semibold text-slate-600">{from}–{to}</span>
                                                {' '}dari{' '}
                                                <span className="font-semibold text-slate-600">{total}</span> siswa
                                            </p>

                                            {/* Buttons */}
                                            <div className="flex items-center gap-1">
                                                {/* First */}
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 rounded-lg"
                                                    disabled={!hasPrev}
                                                    asChild={hasPrev}
                                                >
                                                    {hasPrev
                                                        ? <Link href={pageUrl(1)}><ChevronsLeft className="h-4 w-4" /></Link>
                                                        : <span><ChevronsLeft className="h-4 w-4" /></span>
                                                    }
                                                </Button>

                                                {/* Prev */}
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 rounded-lg"
                                                    disabled={!hasPrev}
                                                    asChild={hasPrev}
                                                >
                                                    {hasPrev
                                                        ? <Link href={pageUrl(current_page - 1)}><ChevronLeft className="h-4 w-4" /></Link>
                                                        : <span><ChevronLeft className="h-4 w-4" /></span>
                                                    }
                                                </Button>

                                                {/* Page numbers */}
                                                {Array.from({ length: last_page }, (_, i) => i + 1)
                                                    .filter((p) => p === 1 || p === last_page || Math.abs(p - current_page) <= 1)
                                                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                                                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                                                        acc.push(p);
                                                        return acc;
                                                    }, [])
                                                    .map((p, i) =>
                                                        p === '...' ? (
                                                            <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">…</span>
                                                        ) : (
                                                            <Button
                                                                key={p}
                                                                variant={p === current_page ? 'default' : 'ghost'}
                                                                size="icon"
                                                                className={`h-8 w-8 rounded-lg text-xs ${p === current_page ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                                                asChild={p !== current_page}
                                                            >
                                                                {p !== current_page
                                                                    ? <Link href={pageUrl(p)}>{p}</Link>
                                                                    : <span>{p}</span>
                                                                }
                                                            </Button>
                                                        )
                                                    )
                                                }

                                                {/* Next */}
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 rounded-lg"
                                                    disabled={!hasNext}
                                                    asChild={hasNext}
                                                >
                                                    {hasNext
                                                        ? <Link href={pageUrl(current_page + 1)}><ChevronRight className="h-4 w-4" /></Link>
                                                        : <span><ChevronRight className="h-4 w-4" /></span>
                                                    }
                                                </Button>

                                                {/* Last */}
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 rounded-lg"
                                                    disabled={!hasNext}
                                                    asChild={hasNext}
                                                >
                                                    {hasNext
                                                        ? <Link href={pageUrl(last_page)}><ChevronsRight className="h-4 w-4" /></Link>
                                                        : <span><ChevronsRight className="h-4 w-4" /></span>
                                                    }
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* ── Edit Dialog ── */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="rounded-2xl sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                                {editTarget?.name.charAt(0).toUpperCase()}
                            </div>
                            Edit Data Siswa
                        </DialogTitle>
                        <DialogDescription>
                            Perbarui informasi akun{' '}
                            <span className="font-medium text-slate-700">{editTarget?.name}</span>.
                            Kosongkan password jika tidak ingin menggantinya.
                        </DialogDescription>
                    </DialogHeader>

                    {editTarget && (
                        <Form {...StudentController.update.form(editTarget.id)} className="grid gap-4">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="edit-name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Lengkap</Label>
                                            <Input id="edit-name" name="name" defaultValue={editTarget.name} required
                                                className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" />
                                            {errors.name && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="edit-email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</Label>
                                            <Input id="edit-email" name="email" type="email" defaultValue={editTarget.email} required
                                                className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" />
                                            {errors.email && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="edit-password" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password Baru</Label>
                                            <Input id="edit-password" name="password" type="password" placeholder="Opsional"
                                                className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" />
                                            {errors.password && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="edit-password-confirm" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Konfirmasi Password</Label>
                                            <Input id="edit-password-confirm" name="password_confirmation" type="password" placeholder="Ulangi password baru"
                                                className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white" />
                                        </div>
                                    </div>

                                    <DialogFooter className="gap-2 pt-2">
                                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditTarget(null)}>
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={processing}
                                            className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60">
                                            <Pencil className="h-3.5 w-3.5" />
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation Dialog ── */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="rounded-2xl sm:max-w-sm">
                    <DialogHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                            <Trash2 className="h-6 w-6 text-red-500" />
                        </div>
                        <DialogTitle>Hapus Siswa?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan menghapus akun{' '}
                            <span className="font-semibold text-slate-800">{deleteTarget?.name}</span>{' '}
                            secara permanen dan tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    {deleteTarget && (
                        <Form {...StudentController.destroy.form(deleteTarget.id)}>
                            {({ processing }) => (
                                <DialogFooter className="gap-2 pt-2">
                                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setDeleteTarget(null)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}
                                        className="gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        {processing ? 'Menghapus...' : 'Ya, Hapus'}
                                    </Button>
                                </DialogFooter>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

TeacherStudents.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: dashboard() },
        { title: 'Data Siswa', href: StudentController.index() },
    ],
};
