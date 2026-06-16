import { Head, router } from '@inertiajs/react';
import {
    BookOpen,
    Clock,
    FileText,
    HelpCircle,
    ListChecks,
    Pencil,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { BarChart } from '@/components/bar-chart';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    status: string;
    duration_minutes: number;
    instructions: string | null;
    starts_at: string | null;
    ends_at: string | null;
    teacher: string;
    subject: string;
    class: string;
    total_questions: number;
};

type QuestionsByType = {
    multiple_choice: number;
    essay: number;
};

type AttemptsStats = {
    total: number;
    submitted: number;
    graded: number;
    avg_score: number | null;
    min_score: number | null;
    max_score: number | null;
    median_score: number | null;
};

type ScoreDistribution = {
    range: string;
    count: number;
};

type Attempt = {
    id: number;
    student_name: string;
    status: string;
    score: number | null;
    duration: number | null;
};

type Props = {
    exam: Exam;
    questions_by_type: QuestionsByType;
    attempts_stats: AttemptsStats;
    score_distribution: ScoreDistribution[];
    attempts: Attempt[];
};

export default function AdminExamShow({
    exam,
    questions_by_type,
    attempts_stats,
    score_distribution,
    attempts,
}: Props) {
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [newStatus, setNewStatus] = useState(exam.status);

    function handleStatusChange() {
        router.patch(
            `/admin/exams/${exam.id}/status`,
            { status: newStatus },
            {
                onSuccess: () => setShowStatusDialog(false),
            },
        );
    }

    function handleDelete() {
        router.delete(`/admin/exams/${exam.id}`);
    }

    const distributionColors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-emerald-500',
        'bg-blue-500',
    ];

    return (
        <>
            <Head title={`Detail Ujian: ${exam.title}`} />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                {exam.title}
                            </h1>
                            <StatusBadge status={exam.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4" />
                                {exam.subject}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                {exam.class}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Pencil className="h-4 w-4" />
                                {exam.teacher}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {exam.duration_minutes} menit
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusDialog(true)}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Ubah Status
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </div>
                </div>

                {/* Stat Cards - Questions */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={HelpCircle}
                        label="Total Soal"
                        value={exam.total_questions}
                    />
                    <StatCard
                        icon={ListChecks}
                        label="Pilihan Ganda"
                        value={questions_by_type.multiple_choice}
                    />
                    <StatCard
                        icon={FileText}
                        label="Essay"
                        value={questions_by_type.essay}
                    />
                    <StatCard
                        icon={Users}
                        label="Peserta"
                        value={attempts_stats.total}
                    />
                </div>

                {/* Score Distribution Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Nilai</CardTitle>
                        <CardDescription>
                            Penyebaran nilai siswa per kelompok 20 poin
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {attempts_stats.graded === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada nilai yang tersedia.
                            </p>
                        ) : (
                            <BarChart
                                data={score_distribution.map((d, i) => ({
                                    label: d.range,
                                    value: d.count,
                                    color: distributionColors[i],
                                }))}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Stat Cards - Scores */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={BookOpen}
                        label="Rata-rata"
                        value={attempts_stats.avg_score}
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Tertinggi"
                        value={attempts_stats.max_score}
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Terendah"
                        value={attempts_stats.min_score}
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Median"
                        value={attempts_stats.median_score}
                    />
                </div>

                {/* Attempts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Peserta</CardTitle>
                        <CardDescription>
                            {attempts.length} data pengerjaan ujian terbaru
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {attempts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada siswa yang mengerjakan ujian ini.
                            </p>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 text-center">
                                                No
                                            </TableHead>
                                            <TableHead>Nama Siswa</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Nilai
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Durasi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attempts.map((attempt, index) => (
                                            <TableRow key={attempt.id}>
                                                <TableCell className="text-center text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {attempt.student_name}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        status={attempt.status}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {attempt.score ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {attempt.duration !== null
                                                        ? `${attempt.duration} mnt`
                                                        : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Status Change Dialog */}
            <Dialog
                open={showStatusDialog}
                onOpenChange={setShowStatusDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Ujian</DialogTitle>
                        <DialogDescription>
                            Ubah status ujian "{exam.title}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="completed">
                                    Selesai
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusDialog(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleStatusChange}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Ujian</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus ujian "
                            {exam.title}"? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminExamShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/admin/dashboard' },
        { title: 'Ujian', href: '/admin/exams' },
        { title: 'Detail Ujian', href: '' },
    ],
};
