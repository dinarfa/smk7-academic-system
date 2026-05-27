import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
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
import AdminLayout from '@/layouts/AdminLayout';
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
        <AdminLayout title="Kelola Pengguna">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-8">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                        Manajemen Pengguna
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Kelola Pengguna
                    </h1>
                    <p className="mt-1.5 text-slate-500">
                        Kelola semua pengguna dalam sistem
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline" className="gap-2 rounded-xl border-slate-200 px-6 text-slate-700 hover:bg-slate-50">
                            <Link href={admin.users.create.url()}>
                                <Users className="h-4 w-4" />
                                Tambah Pengguna
                            </Link>
                        </Button>
                        <Button asChild className="gap-2 rounded-xl bg-indigo-600 px-6 hover:bg-indigo-700 shadow-sm">
                            <Link href={admin.reports.overview.url()}>
                                <FileText className="h-4 w-4" />
                                Lihat Laporan
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                            <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">Daftar Pengguna</p>
                            <p className="text-xs text-slate-500">Semua pengguna terdaftar dan aksi cepat.</p>
                        </div>
                    </div>
                </div>

                {users.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                            <Users className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">Belum ada data pengguna</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-100">
                                    <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Pengguna</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dibuat</TableHead>
                                    <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="group transition-colors hover:bg-indigo-50/40 border-b border-slate-100/50"
                                    >
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getAvatarColor(user.role)}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-slate-800">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 ${getRoleBadgeClass(user.role)}`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-400">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </TableCell>
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
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200">
                                                    <DropdownMenuItem asChild className="rounded-lg text-sm">
                                                        <Link href={admin.users.show.url({ user: user.id })} className="w-full cursor-pointer">
                                                            Detail
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100" />
                                                    <DropdownMenuItem asChild className="rounded-lg text-sm text-amber-600 focus:text-amber-700 focus:bg-amber-50">
                                                        <Link href={admin.users.resetPassword.url({ user: user.id })} className="w-full cursor-pointer">
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

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                                <p className="text-xs text-slate-400">
                                    Halaman <span className="font-semibold text-slate-600">{users.current_page}</span> dari <span className="font-semibold text-slate-600">{users.last_page}</span>
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!hasPrev} asChild={hasPrev}>
                                        {hasPrev ? <Link href={pageUrl(1)}><ChevronsLeft className="h-4 w-4" /></Link> : <span><ChevronsLeft className="h-4 w-4" /></span>}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!hasPrev} asChild={hasPrev}>
                                        {hasPrev ? <Link href={users.prev_page_url!}><ChevronLeft className="h-4 w-4" /></Link> : <span><ChevronLeft className="h-4 w-4" /></span>}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!hasNext} asChild={hasNext}>
                                        {hasNext ? <Link href={users.next_page_url!}><ChevronRight className="h-4 w-4" /></Link> : <span><ChevronRight className="h-4 w-4" /></span>}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={!hasNext} asChild={hasNext}>
                                        {hasNext ? <Link href={pageUrl(users.last_page)}><ChevronsRight className="h-4 w-4" /></Link> : <span><ChevronsRight className="h-4 w-4" /></span>}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

function getAvatarColor(role: string) {
    switch (role) {
        case 'admin': return 'bg-rose-100 text-rose-600';
        case 'teacher': return 'bg-indigo-100 text-indigo-600';
        case 'student': return 'bg-emerald-100 text-emerald-600';
        default: return 'bg-slate-100 text-slate-600';
    }
}

function getRoleBadgeClass(role: string) {
    switch (role) {
        case 'admin': return 'bg-rose-50 text-rose-600 hover:bg-rose-100';
        case 'teacher': return 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100';
        case 'student': return 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100';
        default: return 'bg-slate-100 text-slate-600';
    }
}
