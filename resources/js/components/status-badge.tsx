import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
    hadir: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950',
    present: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950',
    terlambat: 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950',
    late: 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950',
    alpha: 'text-red-700 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950',
    absent: 'text-red-700 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950',
    izin: 'text-blue-700 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950',
    excused: 'text-blue-700 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950',
    bolos: 'text-purple-700 border-purple-200 bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:bg-purple-950',
    pending: 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950',
    approved: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950',
    rejected: 'text-red-700 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950',
    active: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950',
    draft: 'text-slate-700 border-slate-200 bg-slate-50 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-950',
    completed: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950',
    submitted: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950',
    in_progress: 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950',
    not_started: 'text-slate-700 border-slate-200 bg-slate-50 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-950',
    published: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950',
    admin: 'text-rose-700 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:bg-rose-950',
    teacher: 'text-indigo-700 border-indigo-200 bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:bg-indigo-950',
    student: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950',
};

const statusLabels: Record<string, string> = {
    hadir: 'Hadir',
    present: 'Hadir',
    terlambat: 'Terlambat',
    late: 'Terlambat',
    alpha: 'Alpha',
    absent: 'Alpha',
    izin: 'Izin',
    excused: 'Izin',
    bolos: 'Bolos',
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    active: 'Aktif',
    draft: 'Draft',
    completed: 'Selesai',
    submitted: 'Selesai',
    in_progress: 'Berlangsung',
    not_started: 'Belum dimulai',
    published: 'Published',
    admin: 'Admin',
    teacher: 'Guru',
    student: 'Siswa',
};

type StatusBadgeProps = {
    status: string;
    label?: string;
    className?: string;
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
    const style = statusStyles[status] ?? statusStyles['draft'];
    const text = label ?? statusLabels[status] ?? status;

    return (
        <Badge variant="outline" className={cn(style, className)}>
            {text}
        </Badge>
    );
}
