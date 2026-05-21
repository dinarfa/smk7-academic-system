import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Key, User, Shield, Activity, CalendarDays, History } from 'lucide-react'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

type UserData = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

type AuditLog = {
    id: number;
    action: string;
    description: string;
    admin_name: string;
    created_at: string;
}

type Props = {
    user: UserData;
    auditLogs: AuditLog[];
}

export default function AdminUserShow({ user, auditLogs }: Props) {
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'teacher':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'student':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <AdminLayout title={`Detail User: ${user.name}`}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-8">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                        Profil Pengguna
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Detail Pengguna
                    </h1>
                    <p className="mt-1.5 text-slate-500">
                        Lihat profil pengguna dan log aktivitasnya.
                    </p>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                    <Button asChild variant="outline" className="rounded-xl border-slate-200">
                        <Link href={admin.users.index.url()}>Kembali ke Daftar</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    {/* ── User summary ── */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm h-fit">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/30 p-8 flex flex-col items-center justify-center text-center border-b border-slate-100">
                            <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4 shadow-sm border-2 border-white text-3xl font-bold text-indigo-600">
                                {getInitials(user.name)}
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                            <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                            
                            <div className="mt-4">
                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getRoleColor(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-slate-50/50">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Shield className="h-4 w-4 text-slate-400" />
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">ID Pengguna</p>
                                        <p className="text-sm font-medium text-slate-700 mt-0.5">#{user.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Terdaftar Pada</p>
                                        <p className="text-sm font-medium text-slate-700 mt-0.5">{new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
                        <div className="border-b border-rose-50 bg-gradient-to-r from-rose-50/50 to-red-50/30 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-rose-600" />
                                <p className="font-semibold text-rose-800">Keamanan Akun</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                Jika pengguna lupa kata sandinya, Anda dapat memaksanya mengubah kata sandi baru.
                            </p>
                            <Button asChild variant="destructive" className="w-full rounded-xl gap-2 shadow-sm">
                                <Link href={admin.users.resetPassword.url({ user: user.id })}>
                                    Reset Password Pengguna
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {/* ── Activity Logs ── */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm h-full flex flex-col">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50/50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                                    <History className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Log Aktivitas</p>
                                    <p className="text-xs text-slate-500">Rekam jejak aksi yang melibatkan pengguna ini.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 flex-1 bg-slate-50/30">
                            {auditLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                                    <Activity className="h-10 w-10 text-slate-300 mb-3" />
                                    <p className="text-sm text-slate-500 font-medium">Belum ada aktivitas tercatat</p>
                                    <p className="text-xs text-slate-400 mt-1">Aktivitas admin terkait akun ini akan muncul di sini.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="relative pl-6 pb-4 border-l border-slate-200 last:border-0 last:pb-0">
                                            <div className="absolute left-[-5px] top-[4px] h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-500"></div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                                        {log.action.replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-sm font-medium text-slate-800 mt-0.5">{log.description}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Oleh: <span className="font-medium text-slate-700">{log.admin_name}</span></p>
                                                </div>
                                                <div className="text-xs font-medium text-slate-400 shrink-0">
                                                    {new Date(log.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
