import { Head, Link } from '@inertiajs/react';
import { Users, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import admin from '@/routes/admin';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

type Props = {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    }
}

export default function AdminUsersIndex({ users }: Props) {
    const hasPrev = users.current_page > 1;
    const hasNext = users.current_page < users.last_page;

    function pageUrl(page: number): string {
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));

        return url.pathname + url.search;
    }

    return (
        <>
            <Head title="Kelola Pengguna" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kelola Pengguna</h1>
                        <p className="text-sm text-muted-foreground">Kelola semua pengguna dalam sistem</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={admin.users.create.url()}>
                                <Users className="mr-2 h-4 w-4" />
                                Tambah Pengguna
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href={admin.reports.overview.url()}>
                                <FileText className="mr-2 h-4 w-4" />
                                Lihat Laporan
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card">
                    {users.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-16 text-center">
                            <Users className="h-10 w-10 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">Belum ada data pengguna</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="space-y-2 p-4 sm:hidden">
                                {users.data.map((user) => (
                                    <div key={user.id} className="rounded-lg border border-border bg-card p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getAvatarColor(user.role)}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium">{user.name}</span>
                                            </div>
                                            <StatusBadge status={user.role} />
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop table */}
                            <div className="hidden sm:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">Pengguna</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Dibuat</TableHead>
                                            <TableHead className="pr-6 text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getAvatarColor(user.role)}`}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-foreground">{user.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={user.role} />
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                aria-label="Opsi pengguna"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={admin.users.show.url({ user: user.id })}>
                                                                    Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild className="text-amber-600 focus:text-amber-700">
                                                                <Link href={admin.users.resetPassword.url({ user: user.id })}>
                                                                    Reset Password
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

                            {users.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                                    <p className="text-xs text-muted-foreground">
                                        Halaman <span className="font-medium text-foreground">{users.current_page}</span> dari <span className="font-medium text-foreground">{users.last_page}</span>
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasPrev} asChild={hasPrev} aria-label="Halaman pertama">
                                            {hasPrev ? <Link href={pageUrl(1)}><ChevronsLeft className="h-4 w-4" /></Link> : <span><ChevronsLeft className="h-4 w-4" /></span>}
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasPrev} asChild={hasPrev} aria-label="Halaman sebelumnya">
                                            {hasPrev ? <Link href={users.prev_page_url!}><ChevronLeft className="h-4 w-4" /></Link> : <span><ChevronLeft className="h-4 w-4" /></span>}
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasNext} asChild={hasNext} aria-label="Halaman berikutnya">
                                            {hasNext ? <Link href={users.next_page_url!}><ChevronRight className="h-4 w-4" /></Link> : <span><ChevronRight className="h-4 w-4" /></span>}
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasNext} asChild={hasNext} aria-label="Halaman terakhir">
                                            {hasNext ? <Link href={pageUrl(users.last_page)}><ChevronsRight className="h-4 w-4" /></Link> : <span><ChevronsRight className="h-4 w-4" /></span>}
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

AdminUsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Kelola Pengguna', href: admin.users.index.url() },
    ],
};

function getAvatarColor(role: string) {
    switch (role) {
        case 'admin': return 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400';
        case 'teacher': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400';
        case 'student': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400';
        default: return 'bg-muted text-muted-foreground';
    }
}
