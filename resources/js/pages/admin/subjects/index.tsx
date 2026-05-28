import { Head, Link, useForm } from '@inertiajs/react'
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Plus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import admin from '@/routes/admin'

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
        <>
            <Head title="Mata Pelajaran" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mata Pelajaran</h1>
                    <p className="text-sm text-muted-foreground">Buat dan kelola mata pelajaran untuk setiap kelas.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Buat Mata Pelajaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Kode Mapel</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        value={data.code}
                                        onChange={(event) => setData('code', event.target.value)}
                                        placeholder="MTK"
                                        aria-invalid={Boolean(errors.code)}
                                    />
                                    {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Kelas</Label>
                                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3">
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
                                        <p className="text-xs text-destructive">{errors.school_class_ids}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="teacher_id">Guru</Label>
                                    <Select
                                        value={data.teacher_id}
                                        onValueChange={(value) => setData('teacher_id', value)}
                                    >
                                        <SelectTrigger className="w-full" id="teacher_id">
                                            <SelectValue placeholder="Pilih Guru" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={String(teacher.id)}>
                                                    {teacher.name} ({teacher.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.teacher_id && (
                                        <p className="text-xs text-destructive">{errors.teacher_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Mata Pelajaran</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        placeholder="Matematika"
                                        aria-invalid={Boolean(errors.name)}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Mapel'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Mapel Terdaftar ({subjects.data.length})</CardTitle>
                        </CardHeader>

                        {subjects.data.length === 0 ? (
                            <CardContent>
                                <div className="flex flex-col items-center gap-4 py-16 text-center">
                                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-foreground">Belum ada mata pelajaran</p>
                                        <p className="mt-1 text-sm text-muted-foreground">Buat mata pelajaran baru di formulir samping.</p>
                                    </div>
                                </div>
                            </CardContent>
                        ) : (
                            <>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12 pl-6">#</TableHead>
                                                <TableHead>Mata Pelajaran</TableHead>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Kelas</TableHead>
                                                <TableHead>Guru</TableHead>
                                                <TableHead className="pr-6 text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subjects.data.map((subject, index) => (
                                                <TableRow key={subject.id}>
                                                    <TableCell className="pl-6 text-sm text-muted-foreground">
                                                        {(subjects.current_page - 1) * 10 + index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium text-foreground">{subject.name}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{subject.code}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {subject.school_classes.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {subject.school_classes.map((c) => (
                                                                    <Badge key={c.id} variant="outline">
                                                                        {c.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {subject.teacher ? (
                                                            <span className="text-sm text-foreground">{subject.teacher.name}</span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="pr-6 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={admin.subjects.edit.url({ subject: subject.id })}>
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                                                                    <Link
                                                                        href={admin.subjects.destroy.url({ subject: subject.id })}
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
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>

                                {subjects.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-border px-6 py-4">
                                        <p className="text-xs text-muted-foreground">
                                            Halaman <span className="font-medium text-foreground">{subjects.current_page}</span> dari{' '}
                                            <span className="font-medium text-foreground">{subjects.last_page}</span>
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasPrev} asChild={hasPrev}>
                                                {hasPrev ? <Link href={pageUrl(1)}><ChevronsLeft className="h-4 w-4" /></Link> : <span><ChevronsLeft className="h-4 w-4" /></span>}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasPrev} asChild={hasPrev}>
                                                {hasPrev ? <Link href={subjects.prev_page_url!}><ChevronLeft className="h-4 w-4" /></Link> : <span><ChevronLeft className="h-4 w-4" /></span>}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasNext} asChild={hasNext}>
                                                {hasNext ? <Link href={subjects.next_page_url!}><ChevronRight className="h-4 w-4" /></Link> : <span><ChevronRight className="h-4 w-4" /></span>}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasNext} asChild={hasNext}>
                                                {hasNext ? <Link href={pageUrl(subjects.last_page)}><ChevronsRight className="h-4 w-4" /></Link> : <span><ChevronsRight className="h-4 w-4" /></span>}
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
    )
}

AdminSubjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Mata Pelajaran', href: admin.subjects.index.url() },
    ],
}
