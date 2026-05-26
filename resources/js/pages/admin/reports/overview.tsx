import { Link } from '@inertiajs/react'
import { FileBarChart2, Users, CalendarDays, Activity, UsersRound, Calendar, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

type Summary = {
    total_users: number;
    total_teachers: number;
    total_students: number;
    total_sessions: number;
    total_records: number;
    today_records: number;
}

type TopStudent = {
    student_id: number;
    student_name: string;
    student_email: string;
    attendance_count: number;
}

type RecentSession = {
    id: number;
    subject: string;
    type: string;
    opened_by: string;
    is_active: boolean;
}

type Props = {
    summary: Summary;
    topStudents: TopStudent[];
    recentSessions: RecentSession[];
}

export default function AdminReportsOverview({ summary, topStudents, recentSessions }: Props) {
    return (
        <AdminLayout title="Ringkasan Laporan">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Ringkasan Laporan</h1>
                        <p className="text-muted-foreground">Statistik sistem dan data kehadiran</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm">
                            <Link href={admin.reports.bySession.url()}>Per Sesi</Link>
                        </Button>
                        <Button asChild size="sm" variant="secondary">
                            <Link href={admin.reports.byClass.url()}>Per Kelas</Link>
                        </Button>
                        <Button asChild size="sm" variant="secondary">
                            <Link href={admin.reports.export.url()}>Ekspor CSV</Link>
                        </Button>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                    <Button asChild variant="outline" className="rounded-xl border-slate-200">
                        <Link href={admin.reports.bySession.url()}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Per Sesi
                        </Link>
                    </Button>
                    <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                        <Link href={admin.reports.export.url()}>
                            <Download className="mr-2 h-4 w-4" />
                            Ekspor CSV
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
                <StatCard label="Total Pengguna" value={summary.total_users} icon={<UsersRound className="h-5 w-5 text-blue-600" />} color="blue" />
                <StatCard label="Guru" value={summary.total_teachers} icon={<Users className="h-5 w-5 text-emerald-600" />} color="emerald" />
                <StatCard label="Siswa" value={summary.total_students} icon={<Users className="h-5 w-5 text-purple-600" />} color="purple" />
                <StatCard label="Total Sesi" value={summary.total_sessions} icon={<Calendar className="h-5 w-5 text-amber-600" />} color="amber" />
                <StatCard label="Total Absen" value={summary.total_records} icon={<FileBarChart2 className="h-5 w-5 text-rose-600" />} color="rose" />
                <StatCard label="Absen Hari Ini" value={summary.today_records} icon={<Activity className="h-5 w-5 text-indigo-600" />} color="indigo" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* ── Top Students ── */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
                    <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/30 p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 shadow-sm border border-emerald-200/50">
                            <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Siswa Terajin</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Siswa dengan jumlah kehadiran tertinggi.</p>
                        </div>
                    </div>
                    <div className="p-0 flex-1">
                        {topStudents.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">Belum ada data kehadiran</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {topStudents.map((student, index) => (
                                    <div key={student.student_id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{student.student_name}</p>
                                                <p className="text-xs text-slate-500">{student.student_email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-emerald-600">{student.attendance_count}</p>
                                            <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Kehadiran</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Recent Sessions ── */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
                    <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/30 p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 shadow-sm border border-indigo-200/50">
                            <CalendarDays className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Sesi Terbaru</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Sesi kehadiran terakhir di seluruh kelas.</p>
                        </div>
                    </div>
                    <div className="p-0 flex-1">
                        {recentSessions.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">Belum ada sesi</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{session.subject}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-medium text-slate-600">{session.type}</span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-500">oleh {session.opened_by}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${session.is_active
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                : 'bg-slate-100 border-slate-200 text-slate-600'
                                                }`}>
                                                {session.is_active ? 'Aktif' : 'Ditutup'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Akses Cepat</CardTitle>
                    <CardDescription>Langkah ke bagian admin yang sering digunakan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Button asChild variant="outline" className="justify-center">
                            <Link href={admin.reports.byStudent.url()}>Per Siswa</Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-center">
                            <Link href={admin.reports.byClass.url()}>Per Kelas</Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-center">
                            <Link href={admin.users.index.url()}>Kelola Pengguna</Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-center">
                            <Link href={admin.auditLogs.index.url()}>Log Audit</Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-center">
                            <Link href={admin.dashboard.url()}>Dashboard</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout >
    )
}

type StatCardProps = {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-100',
        emerald: 'bg-emerald-50 border-emerald-100',
        purple: 'bg-purple-50 border-purple-100',
        amber: 'bg-amber-50 border-amber-100',
        rose: 'bg-rose-50 border-rose-100',
        indigo: 'bg-indigo-50 border-indigo-100',
    }
    const iconBgClasses = {
        blue: 'bg-blue-100 border-blue-200/50',
        emerald: 'bg-emerald-100 border-emerald-200/50',
        purple: 'bg-purple-100 border-purple-200/50',
        amber: 'bg-amber-100 border-amber-200/50',
        rose: 'bg-rose-100 border-rose-200/50',
        indigo: 'bg-indigo-100 border-indigo-200/50',
    }

    return (
        <div className={`overflow-hidden rounded-2xl border ${colorClasses[color]} shadow-sm p-5 relative group hover:-translate-y-1 transition-all`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm border ${iconBgClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
