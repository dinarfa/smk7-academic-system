import { Head, Link, router } from '@inertiajs/react';
import {
    FileText,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Search,
    ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Exam = {
    id: number;
    title: string;
    subject: string | null;
    class: string | null;
    creator: { id: number; name: string } | null;
    status: string;
    attempts_count: number;
    questions_count: number;
    created_at: string;
};

type Teacher = { id: number; name: string };
type Subject = { id: number; name: string };
type SchoolClass = { id: number; name: string };

type Props = {
    exams: {
        data: Exam[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    teachers: Teacher[];
    subjects: Subject[];
    classes: SchoolClass[];
    filters?: {
        status?: string;
        created_by?: string;
        subject_id?: string;
        class_id?: string;
        search?: string;
    };
};

export default function AdminExamsIndex({ exams, teachers, subjects, classes, filters }: Props) {
    const [status, setStatus] = useState(filters?.status ?? '');
    const [createdBy, setCreatedBy] = useState(filters?.created_by ?? '');
    const [subjectId, setSubjectId] = useState(filters?.subject_id ?? '');
    const [classId, setClassId] = useState(filters?.class_id ?? '');
    const [search, setSearch] = useState(filters?.search ?? '');
    const hasPrev = exams.current_page > 1;
    const hasNext = exams.current_page < exams.last_page;

    function handleFilter() {
        const params: Record<string, string> = {};

        if (status && status !== 'all') params.status = status;
        if (createdBy && createdBy !== 'all') params.created_by = createdBy;
        if (subjectId && subjectId !== 'all') params.subject_id = subjectId;
        if (classId && classId !== 'all') params.class_id = classId;
        if (search) params.search = search;

        router.get('/admin/exams', params, { preserveState: true });
    }

    function pageUrl(page: number): string {
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));
        return url.pathname + url.search;
    }

    return (
        <>
            <Head title="Kelola Ujian" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Kelola Ujian
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Pantau dan kelola semua ujian yang dibuat oleh guru
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Status
                        </label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Guru
                        </label>
                        <Select value={createdBy} onValueChange={setCreatedBy}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Semua Guru" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Guru</SelectItem>
                                {teachers.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Mata Pelajaran
                        </label>
                        <Select value={subjectId} onValueChange={setSubjectId}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Semua Mapel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Mapel</SelectItem>
                                {subjects.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Kelas
                        </label>
                        <Select value={classId} onValueChange={setClassId}>
                            <SelectTrigger className="w-40">
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
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Cari
                        </label>
                        <Input
                            placeholder="Judul ujian..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-56"
                        />
                    </div>
                    <Button onClick={handleFilter} size="sm">
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                <div className="rounded-lg border border-border bg-card">
                    {exams.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-16 text-center">
                            <ClipboardList className="h-10 w-10 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">
                                    Belum ada data ujian
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ujian yang dibuat oleh guru akan muncul di sini.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="space-y-2 p-4 sm:hidden">
                                {exams.data.map((exam) => (
                                    <div
                                        key={exam.id}
                                        className="rounded-lg border border-border bg-card p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                {exam.title}
                                            </span>
                                            <StatusBadge status={exam.status} />
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {exam.creator?.name ?? '-'} &middot; {exam.subject ?? '-'} &middot; {exam.class ?? '-'}
                                        </p>
                                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{exam.questions_count} soal</span>
                                            <span>{exam.attempts_count} pengerjaan</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop table */}
                            <div className="hidden sm:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">
                                                Judul Ujian
                                            </TableHead>
                                            <TableHead>Guru</TableHead>
                                            <TableHead>Mata Pelajaran</TableHead>
                                            <TableHead>Kelas</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-center">Soal</TableHead>
                                            <TableHead className="text-center">Pengerjaan</TableHead>
                                            <TableHead className="pr-6 text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {exams.data.map((exam) => (
                                            <TableRow key={exam.id}>
                                                <TableCell className="pl-6">
                                                    <span className="font-medium text-foreground">
                                                        {exam.title}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {exam.creator?.name ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {exam.subject ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {exam.class ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={exam.status} />
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {exam.questions_count}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {exam.attempts_count}
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                aria-label="Opsi ujian"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/exams/${exam.id}`}>
                                                                    Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {exams.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                                    <p className="text-xs text-muted-foreground">
                                        Halaman{' '}
                                        <span className="font-medium text-foreground">
                                            {exams.current_page}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-medium text-foreground">
                                            {exams.last_page}
                                        </span>
                                    </p>
                                    <div className="flex items-center gap-1">
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
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={!hasPrev}
                                            asChild={hasPrev}
                                            aria-label="Halaman sebelumnya"
                                        >
                                            {hasPrev ? (
                                                <Link href={exams.prev_page_url!}>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Link>
                                            ) : (
                                                <span>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={!hasNext}
                                            asChild={hasNext}
                                            aria-label="Halaman berikutnya"
                                        >
                                            {hasNext ? (
                                                <Link href={exams.next_page_url!}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            ) : (
                                                <span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={!hasNext}
                                            asChild={hasNext}
                                            aria-label="Halaman terakhir"
                                        >
                                            {hasNext ? (
                                                <Link href={pageUrl(exams.last_page)}>
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
            </div>
        </>
    );
}

AdminExamsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/admin/dashboard' },
        { title: 'Kelola Ujian', href: '/admin/exams' },
    ],
};
