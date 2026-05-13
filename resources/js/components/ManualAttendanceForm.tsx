import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

type Student = {
    id: number;
    name: string;
    student_id?: string;
};

interface ManualAttendanceFormProps {
    students: Student[];
    sessionId: number;
    phase: 'morning' | 'class' | 'dismissal';
    onSubmit?: () => void;
}

export default function ManualAttendanceForm({
    students,
    sessionId,
    phase,
    onSubmit,
}: ManualAttendanceFormProps) {
    const [selections, setSelections] = useState<Record<number, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusOptions = [
        { value: 'present', label: 'Hadir' },
        { value: 'late', label: 'Terlambat' },
        { value: 'absent', label: 'Tidak Hadir' },
        { value: 'excused', label: 'Izin' },
    ];

    const handleStatusChange = (studentId: number, status: string) => {
        setSelections((prev) => ({
            ...prev,
            [studentId]: selections[studentId] === status ? '' : status,
        }));
    };

    const handleSelectAll = (status: string) => {
        const newSelections: Record<number, string> = {};
        students.forEach((s) => {
            newSelections[s.id] = status;
        });
        setSelections(newSelections);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const attendanceRecords = students
            .filter((s) => selections[s.id])
            .map((s) => ({
                student_id: s.id,
                status: selections[s.id],
            }));

        if (attendanceRecords.length === 0) {
            alert('Pilih minimal 1 siswa');
            setIsSubmitting(false);
            return;
        }

        router.post(
            '/teacher/attendance/manual',
            {
                session_id: sessionId,
                phase,
                students: attendanceRecords,
            },
            {
                onSuccess: () => {
                    setSelections({});
                    onSubmit?.();
                },
                onError: (errors) => {
                    console.error('Submit error:', errors);
                    alert('Gagal menyimpan absensi manual');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    const selectedCount = Object.values(selections).filter((s) => s).length;

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Absensi Manual</CardTitle>
                <CardDescription>
                    Catat absensi siswa secara manual jika QR tidak tersedia (fase: {phase})
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                        <Button
                            key={option.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectAll(option.value)}
                            className="text-xs"
                        >
                            Pilih Semua {option.label}
                        </Button>
                    ))}
                </div>

                {/* Student list */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {students.map((student) => (
                        <div
                            key={student.id}
                            className="flex items-center gap-3 p-2 border border-border/50 rounded hover:bg-muted/30"
                        >
                            <span className="flex-1 text-sm font-medium">{student.name}</span>
                            <div className="flex gap-2">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleStatusChange(student.id, option.value)}
                                        className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                                            selections[student.id] === option.value
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        {option.label.charAt(0)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="text-sm text-muted-foreground">
                    Dipilih: <span className="font-medium">{selectedCount}</span> dari {students.length} siswa
                </div>

                {/* Submit button */}
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || selectedCount === 0}
                    className="w-full"
                >
                    {isSubmitting ? 'Mengirim...' : `Kirim ${selectedCount} Absensi`}
                </Button>
            </CardContent>
        </Card>
    );
}
