import { Head, Form, Link } from '@inertiajs/react';
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
import { useState } from 'react';
import SchoolClassController from '@/actions/App/Http/Controllers/Admin/SchoolClassController';
import StudentController from '@/actions/App/Http/Controllers/Teacher/StudentController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import teacher from '@/routes/teacher';

type Student = {
    id: number;
    name: string;
    email: string;
    school_class_id: number | null;
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
    canManageStudents: boolean;
    schoolClasses: SchoolClass[];
    students: PaginatedStudents;
};

export default function TeacherStudents({
    canManageStudents,
    schoolClasses,
    students,
}: Props) {
    const totalStudents = schoolClasses.reduce(
        (sum, c) => sum + c.students_count,
        0,
    );

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

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* ── Page Header ── */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Data Siswa
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {canManageStudents
                            ? 'Kelola akun siswa dan penempatan kelas.'
                            : 'Lihat data siswa di kelas perwalian Anda.'}
                    </p>
                </div>

                {/* ── Kelas Wali ── */}
                <section>
                    <h2 className="mb-3 text-lg font-medium text-foreground">
                        Daftar Kelas
                    </h2>

                    {schoolClasses.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {schoolClasses.map((sc) => (
                                <div
                                    key={sc.id}
                                    className="rounded-lg border border-border bg-card p-5"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-base font-semibold text-foreground">
                                                {sc.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {sc.academic_year ??
                                                    'Tahun ajaran belum diset'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                            {sc.code ?? '—'}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1.5 text-muted-foreground">
                                        <Users className="h-3.5 w-3.5" />
                                        <span className="text-sm">
                                            <span className="font-medium text-foreground">
                                                {sc.students_count}
                                            </span>{' '}
                                            siswa
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">
                                    Belum ada kelas
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Buat kelas terlebih dahulu sebelum
                                    menambahkan siswa.
                                </p>
                            </div>
                            {canManageStudents && (
                                <Button asChild className="gap-2">
                                    <Link
                                        href={SchoolClassController.index.url()}
                                    >
                                        <Plus className="h-4 w-4" /> Kelola
                                        Kelas
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </section>

                {canManageStudents ? (
                    <section>
                        <h2 className="mb-3 text-lg font-medium text-foreground">
                            Tambah Akun Siswa
                        </h2>

                        <div className="overflow-hidden rounded-lg border border-border bg-card">
                            <div className="border-b border-border bg-muted/30 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            Buat Akun Siswa
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Isi data lengkap dan pilih kelas
                                            tujuan.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {schoolClasses.length === 0 ? (
                                    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        Form siswa akan aktif setelah kelas
                                        dibuat.
                                    </div>
                                ) : (
                                    <Form
                                        {...StudentController.store.form()}
                                        className="grid gap-5 sm:grid-cols-2"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="name">
                                                        Nama Lengkap
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        required
                                                        placeholder="Contoh: Budi Santoso"
                                                    />
                                                    {errors.name && (
                                                        <p className="flex items-center gap-1 text-xs text-destructive">
                                                            <AlertCircle className="h-3 w-3" />
                                                            {errors.name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="email">
                                                        Email
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        required
                                                        placeholder="siswa@sekolah.ac.id"
                                                    />
                                                    {errors.email && (
                                                        <p className="flex items-center gap-1 text-xs text-destructive">
                                                            <AlertCircle className="h-3 w-3" />
                                                            {errors.email}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="password">
                                                        Password
                                                    </Label>
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        required
                                                        placeholder="Min. 8 karakter"
                                                    />
                                                    {errors.password && (
                                                        <p className="flex items-center gap-1 text-xs text-destructive">
                                                            <AlertCircle className="h-3 w-3" />
                                                            {errors.password}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="password_confirmation">
                                                        Konfirmasi Password
                                                    </Label>
                                                    <Input
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        type="password"
                                                        required
                                                        placeholder="Ulangi password"
                                                    />
                                                </div>

                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="school_class_id">
                                                        Kelas
                                                    </Label>
                                                    <select
                                                        id="school_class_id"
                                                        name="school_class_id"
                                                        required
                                                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                                        defaultValue={
                                                            schoolClasses[0]?.id
                                                        }
                                                    >
                                                        {schoolClasses.map(
                                                            (sc) => (
                                                                <option
                                                                    key={sc.id}
                                                                    value={
                                                                        sc.id
                                                                    }
                                                                >
                                                                    {sc.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    {errors.school_class_id && (
                                                        <p className="flex items-center gap-1 text-xs text-destructive">
                                                            <AlertCircle className="h-3 w-3" />
                                                            {
                                                                errors.school_class_id
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-end sm:col-span-2">
                                                    <Button
                                                        disabled={processing}
                                                        className="gap-2"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        {processing
                                                            ? 'Menyimpan...'
                                                            : 'Simpan Siswa'}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    </section>
                ) : null}

                {/* ── Daftar Siswa ── */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-medium text-foreground">
                            Daftar Siswa
                        </h2>
                        {total > 0 && (
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                {total} siswa
                            </span>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-lg border border-border bg-card">
                        {students.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-16 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                    <Users className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">
                                        Belum ada data siswa
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Tambahkan siswa menggunakan form di
                                        atas.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Mobile cards */}
                                <div className="space-y-2 p-4 sm:hidden">
                                    {students.data.map((student) => (
                                        <div
                                            key={student.id}
                                            className="rounded-lg border border-border bg-card p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                                        {student.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {student.name}
                                                    </span>
                                                </div>
                                                {student.school_class_name ? (
                                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                                        {
                                                            student.school_class_name
                                                        }
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {student.email}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop table */}
                                <div className="hidden sm:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12 pl-5">
                                                    #
                                                </TableHead>
                                                <TableHead>Siswa</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Kelas</TableHead>
                                                {canManageStudents && (
                                                    <TableHead className="pr-5 text-right">
                                                        Aksi
                                                    </TableHead>
                                                )}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.data.map(
                                                (student, idx) => (
                                                    <TableRow
                                                        key={student.id}
                                                        className="group"
                                                    >
                                                        <TableCell className="pl-5 text-sm text-muted-foreground">
                                                            {(from ?? 1) + idx}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                                                    {student.name
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>
                                                                <span className="font-medium text-foreground">
                                                                    {
                                                                        student.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {student.email}
                                                        </TableCell>
                                                        <TableCell>
                                                            {student.school_class_name ? (
                                                                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                                                    {
                                                                        student.school_class_name
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        {canManageStudents && (
                                                            <TableCell className="pr-5 text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                                                                            aria-label="Opsi siswa"
                                                                        >
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent
                                                                        align="end"
                                                                        className="w-40"
                                                                    >
                                                                        <DropdownMenuItem
                                                                            className="gap-2 text-sm"
                                                                            onSelect={() =>
                                                                                setEditTarget(
                                                                                    student,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil className="h-3.5 w-3.5" />
                                                                            Edit
                                                                            Data
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="gap-2 text-sm text-destructive focus:text-destructive"
                                                                            onSelect={() =>
                                                                                setDeleteTarget(
                                                                                    student,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                            Hapus
                                                                            Siswa
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* ── Pagination ── */}
                                {last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-border px-5 py-3">
                                        {/* Info */}
                                        <p className="text-xs text-muted-foreground">
                                            Menampilkan{' '}
                                            <span className="font-medium text-foreground">
                                                {from}–{to}
                                            </span>{' '}
                                            dari{' '}
                                            <span className="font-medium text-foreground">
                                                {total}
                                            </span>{' '}
                                            siswa
                                        </p>

                                        {/* Buttons */}
                                        <div className="flex items-center gap-1">
                                            {/* First */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={!hasPrev}
                                                asChild={hasPrev}
                                                aria-label="Halaman pertama"
                                            >
                                                {hasPrev ? (
                                                    <Link href={pageUrl(1)}>
                                                        <ChevronsLeft className="h-4 w-4" />
                                                    </Link>
                                                ) : (
                                                    <span>
                                                        <ChevronsLeft className="h-4 w-4" />
                                                    </span>
                                                )}
                                            </Button>

                                            {/* Prev */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={!hasPrev}
                                                asChild={hasPrev}
                                                aria-label="Halaman sebelumnya"
                                            >
                                                {hasPrev ? (
                                                    <Link
                                                        href={pageUrl(
                                                            current_page - 1,
                                                        )}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Link>
                                                ) : (
                                                    <span>
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </span>
                                                )}
                                            </Button>

                                            {/* Page numbers */}
                                            {Array.from(
                                                { length: last_page },
                                                (_, i) => i + 1,
                                            )
                                                .filter(
                                                    (p) =>
                                                        p === 1 ||
                                                        p === last_page ||
                                                        Math.abs(
                                                            p - current_page,
                                                        ) <= 1,
                                                )
                                                .reduce<(number | '...')[]>(
                                                    (acc, p, i, arr) => {
                                                        if (
                                                            i > 0 &&
                                                            p -
                                                                (arr[
                                                                    i - 1
                                                                ] as number) >
                                                                1
                                                        ) {
                                                            acc.push('...');
                                                        }

                                                        acc.push(p);

                                                        return acc;
                                                    },
                                                    [],
                                                )
                                                .map((p, i) =>
                                                    p === '...' ? (
                                                        <span
                                                            key={`ellipsis-${i}`}
                                                            className="px-1 text-xs text-muted-foreground"
                                                        >
                                                            …
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            key={p}
                                                            variant={
                                                                p ===
                                                                current_page
                                                                    ? 'default'
                                                                    : 'ghost'
                                                            }
                                                            size="icon"
                                                            className="h-8 w-8 text-xs"
                                                            asChild={
                                                                p !==
                                                                current_page
                                                            }
                                                        >
                                                            {p !==
                                                            current_page ? (
                                                                <Link
                                                                    href={pageUrl(
                                                                        p,
                                                                    )}
                                                                >
                                                                    {p}
                                                                </Link>
                                                            ) : (
                                                                <span>{p}</span>
                                                            )}
                                                        </Button>
                                                    ),
                                                )}

                                            {/* Next */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={!hasNext}
                                                asChild={hasNext}
                                                aria-label="Halaman berikutnya"
                                            >
                                                {hasNext ? (
                                                    <Link
                                                        href={pageUrl(
                                                            current_page + 1,
                                                        )}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Link>
                                                ) : (
                                                    <span>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </span>
                                                )}
                                            </Button>

                                            {/* Last */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={!hasNext}
                                                asChild={hasNext}
                                                aria-label="Halaman terakhir"
                                            >
                                                {hasNext ? (
                                                    <Link
                                                        href={pageUrl(
                                                            last_page,
                                                        )}
                                                    >
                                                        <ChevronsRight className="h-4 w-4" />
                                                    </Link>
                                                ) : (
                                                    <span>
                                                        <ChevronsRight className="h-4 w-4" />
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>

            {canManageStudents && (
                /* ── Edit Dialog ── */
                <Dialog
                    open={!!editTarget}
                    onOpenChange={(open) => !open && setEditTarget(null)}
                >
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                                    {editTarget?.name.charAt(0).toUpperCase()}
                                </div>
                                Edit Data Siswa
                            </DialogTitle>
                            <DialogDescription>
                                Perbarui informasi akun{' '}
                                <span className="font-medium text-foreground">
                                    {editTarget?.name}
                                </span>
                                . Kosongkan password jika tidak ingin
                                menggantinya.
                            </DialogDescription>
                        </DialogHeader>

                        {editTarget && (
                            <Form
                                {...StudentController.update.form(
                                    editTarget.id,
                                )}
                                className="grid gap-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-name">
                                                    Nama Lengkap
                                                </Label>
                                                <Input
                                                    id="edit-name"
                                                    name="name"
                                                    defaultValue={
                                                        editTarget.name
                                                    }
                                                    required
                                                />
                                                {errors.name && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-email">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="edit-email"
                                                    name="email"
                                                    type="email"
                                                    defaultValue={
                                                        editTarget.email
                                                    }
                                                    required
                                                />
                                                {errors.email && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-password">
                                                    Password Baru
                                                </Label>
                                                <Input
                                                    id="edit-password"
                                                    name="password"
                                                    type="password"
                                                    placeholder="Opsional"
                                                />
                                                {errors.password && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-password-confirm">
                                                    Konfirmasi Password
                                                </Label>
                                                <Input
                                                    id="edit-password-confirm"
                                                    name="password_confirmation"
                                                    type="password"
                                                    placeholder="Ulangi password baru"
                                                />
                                            </div>

                                            <div className="grid gap-1.5 sm:col-span-2">
                                                <Label htmlFor="edit-school-class-id">
                                                    Kelas
                                                </Label>
                                                <select
                                                    id="edit-school-class-id"
                                                    name="school_class_id"
                                                    required
                                                    defaultValue={String(
                                                        editTarget.school_class_id ??
                                                            '',
                                                    )}
                                                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                                >
                                                    {schoolClasses.map((sc) => (
                                                        <option
                                                            key={sc.id}
                                                            value={sc.id}
                                                        >
                                                            {sc.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.school_class_id && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors.school_class_id}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <DialogFooter className="gap-2 pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setEditTarget(null)
                                                }
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="gap-2"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                {processing
                                                    ? 'Menyimpan...'
                                                    : 'Simpan Perubahan'}
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {canManageStudents && (
                /* ── Delete Confirmation Dialog ── */
                <Dialog
                    open={!!deleteTarget}
                    onOpenChange={(open) => !open && setDeleteTarget(null)}
                >
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                                <Trash2 className="h-6 w-6 text-destructive" />
                            </div>
                            <DialogTitle>Hapus Siswa?</DialogTitle>
                            <DialogDescription>
                                Tindakan ini akan menghapus akun{' '}
                                <span className="font-semibold text-foreground">
                                    {deleteTarget?.name}
                                </span>{' '}
                                secara permanen dan tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>

                        {deleteTarget && (
                            <Form
                                {...StudentController.destroy.form(
                                    deleteTarget.id,
                                )}
                            >
                                {({ processing }) => (
                                    <DialogFooter className="gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setDeleteTarget(null)
                                            }
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={processing}
                                            className="gap-2"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            {processing
                                                ? 'Menghapus...'
                                                : 'Ya, Hapus'}
                                        </Button>
                                    </DialogFooter>
                                )}
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

TeacherStudents.layout = {
    breadcrumbs: [
        { title: 'Dashboard Guru', href: teacher.dashboard.url() },
        { title: 'Data Siswa', href: StudentController.index() },
    ],
};
