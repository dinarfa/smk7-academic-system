import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Plus,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import admin from '@/routes/admin';

type Subject = {
    id: number;
    name: string;
    department: {
        id: number;
        name: string;
        code: string;
    } | null;
    school_classes: {
        id: number;
        name: string;
        teacher_id: number | null;
    }[];
    created_at: string | null;
    updated_at: string | null;
};

type SchoolClass = {
    id: number;
    name: string;
};

type Teacher = {
    id: number;
    name: string;
    email: string;
};

type Department = {
    id: number;
    name: string;
    code: string;
};

type Props = {
    classes: SchoolClass[];
    teachers: Teacher[];
    departments: Department[];
    subjects: {
        data: Subject[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters?: {
        teacher_id?: string;
        class_id?: string;
        search?: string;
    };
};

export default function AdminSubjectsIndex({
    classes,
    teachers,
    departments,
    subjects,
    filters,
}: Props) {
    const [filterTeacher, setFilterTeacher] = useState(
        filters?.teacher_id ?? '',
    );
    const [filterClass, setFilterClass] = useState(filters?.class_id ?? '');
    const [search, setSearch] = useState(filters?.search ?? '');

    function handleFilter() {
        const params: Record<string, string> = {};

        if (filterTeacher && filterTeacher !== 'all') {
            params.teacher_id = filterTeacher;
        }

        if (filterClass && filterClass !== 'all') {
            params.class_id = filterClass;
        }

        if (search) {
            params.search = search;
        }

        router.get(admin.subjects.index.url(), params, { preserveState: true });
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        department_id: '',
        school_class_ids: [] as string[],
    });

    const hasPrev = subjects.current_page > 1;
    const hasNext = subjects.current_page < subjects.last_page;

    function pageUrl(page: number): string {
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));

        return url.pathname + url.search;
    }

    function toggleClass(classId: string) {
        setData(
            'school_class_ids',
            data.school_class_ids.includes(classId)
                ? data.school_class_ids.filter((id) => id !== classId)
                : [...data.school_class_ids, classId],
        );
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        post(admin.subjects.store.url(), {
            onSuccess: () => reset(),
        });
    }

    return (
        <>
            <Head title="Mata Pelajaran" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Mata Pelajaran
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Buat dan kelola mata pelajaran untuk setiap kelas.
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Guru
                        </label>
                        <Select
                            value={filterTeacher}
                            onValueChange={setFilterTeacher}
                        >
                            <SelectTrigger className="w-48">
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
                            Kelas
                        </label>
                        <Select
                            value={filterClass}
                            onValueChange={setFilterClass}
                        >
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
                            placeholder="Nama atau kode mapel..."
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

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Buat Mata Pelajaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Kelas</Label>
                                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3">
                                        {classes.map((schoolClass) => (
                                            <label
                                                key={schoolClass.id}
                                                className="flex cursor-pointer items-center gap-2 text-sm"
                                            >
                                                <Checkbox
                                                    checked={data.school_class_ids.includes(
                                                        String(schoolClass.id),
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleClass(
                                                            String(
                                                                schoolClass.id,
                                                            ),
                                                        )
                                                    }
                                                />
                                                {schoolClass.name}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.school_class_ids && (
                                        <p className="text-xs text-destructive">
                                            {errors.school_class_ids}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nama Mata Pelajaran
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="Matematika"
                                        aria-invalid={Boolean(errors.name)}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department_id">
                                        Jurusan{' '}
                                        <span className="text-muted-foreground">
                                            (opsional)
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(value) =>
                                            setData('department_id', value)
                                        }
                                    >
                                        <SelectTrigger
                                            className="w-full"
                                            id="department_id"
                                        >
                                            <SelectValue placeholder="Umum (semua jurusan)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">
                                                Umum (semua jurusan)
                                            </SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.id}
                                                    value={String(dept.id)}
                                                >
                                                    {dept.code} - {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.department_id}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Mapel'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>
                                Mapel Terdaftar ({subjects.data.length})
                            </CardTitle>
                        </CardHeader>

                        {subjects.data.length === 0 ? (
                            <CardContent>
                                <div className="flex flex-col items-center gap-4 py-16 text-center">
                                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Belum ada mata pelajaran
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Buat mata pelajaran baru di formulir
                                            samping.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        ) : (
                            <>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12 pl-6">
                                                    #
                                                </TableHead>
                                                <TableHead>
                                                    Mata Pelajaran
                                                </TableHead>
                                                <TableHead>
                                                    Guru & Kelas
                                                </TableHead>
                                                <TableHead className="pr-6 text-right">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subjects.data.map(
                                                (subject, index) => (
                                                    <TableRow key={subject.id}>
                                                        <TableCell className="pl-6 text-sm text-muted-foreground">
                                                            {(subjects.current_page -
                                                                1) *
                                                                10 +
                                                                index +
                                                                1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-medium text-foreground">
                                                                {subject.name}
                                                            </span>
                                                            {subject.department && (
                                                                <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                                                    {
                                                                        subject
                                                                            .department
                                                                            .code
                                                                    }
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {subject
                                                                .school_classes
                                                                .length > 0 ? (
                                                                <div className="flex flex-col gap-1.5">
                                                                    {(() => {
                                                                        const grouped =
                                                                            subject.school_classes.reduce<
                                                                                Record<
                                                                                    string,
                                                                                    (typeof subject.school_classes)[number][]
                                                                                >
                                                                            >(
                                                                                (
                                                                                    acc,
                                                                                    c,
                                                                                ) => {
                                                                                    const key =
                                                                                        String(
                                                                                            c.teacher_id ??
                                                                                                'unassigned',
                                                                                        );
                                                                                    (acc[
                                                                                        key
                                                                                    ] ??=
                                                                                        []).push(
                                                                                        c,
                                                                                    );
                                                                                    return acc;
                                                                                },
                                                                                {},
                                                                            );
                                                                        return Object.entries(
                                                                            grouped,
                                                                        ).map(
                                                                            ([
                                                                                teacherId,
                                                                                classes,
                                                                            ]) => {
                                                                                const teacher =
                                                                                    teachers.find(
                                                                                        (
                                                                                            t,
                                                                                        ) =>
                                                                                            String(
                                                                                                t.id,
                                                                                            ) ===
                                                                                            teacherId,
                                                                                    );
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            teacherId
                                                                                        }
                                                                                        className="flex items-start gap-2"
                                                                                    >
                                                                                        <span className="shrink-0 text-xs font-medium text-foreground">
                                                                                            {teacher
                                                                                                ? teacher.name
                                                                                                : 'Belum ada guru'}

                                                                                            :
                                                                                        </span>
                                                                                        <div className="flex flex-wrap gap-1">
                                                                                            {classes.map(
                                                                                                (
                                                                                                    c,
                                                                                                ) => (
                                                                                                    <Badge
                                                                                                        key={
                                                                                                            c.id
                                                                                                        }
                                                                                                        variant="outline"
                                                                                                        className="text-xs"
                                                                                                    >
                                                                                                        {
                                                                                                            c.name
                                                                                                        }
                                                                                                    </Badge>
                                                                                                ),
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            },
                                                                        );
                                                                    })()}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">
                                                                    -
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="pr-6 text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={admin.subjects.edit.url(
                                                                                {
                                                                                    subject:
                                                                                        subject.id,
                                                                                },
                                                                            )}
                                                                        >
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                        className="text-destructive focus:text-destructive"
                                                                    >
                                                                        <Link
                                                                            href={admin.subjects.destroy.url(
                                                                                {
                                                                                    subject:
                                                                                        subject.id,
                                                                                },
                                                                            )}
                                                                            method="delete"
                                                                            as="button"
                                                                        >
                                                                            Hapus
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>

                                {subjects.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-border px-6 py-4">
                                        <p className="text-xs text-muted-foreground">
                                            Halaman{' '}
                                            <span className="font-medium text-foreground">
                                                {subjects.current_page}
                                            </span>{' '}
                                            dari{' '}
                                            <span className="font-medium text-foreground">
                                                {subjects.last_page}
                                            </span>
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={!hasPrev}
                                                asChild={hasPrev}
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
                                            >
                                                {hasPrev ? (
                                                    <Link
                                                        href={
                                                            subjects.prev_page_url!
                                                        }
                                                    >
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
                                            >
                                                {hasNext ? (
                                                    <Link
                                                        href={
                                                            subjects.next_page_url!
                                                        }
                                                    >
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
                                            >
                                                {hasNext ? (
                                                    <Link
                                                        href={pageUrl(
                                                            subjects.last_page,
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
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminSubjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Mata Pelajaran', href: admin.subjects.index.url() },
    ],
};
