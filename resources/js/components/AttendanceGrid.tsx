import { Badge } from '@/components/ui/badge';

type AttendanceRecord = {
    id: number;
    student_id: number;
    status: string;
    phase: string;
    source: string;
    scanned_at: string;
    student: {
        id: number;
        name: string;
    };
};

type GridData = {
    student_id: number;
    student_name: string;
    morning?: string;
    class?: string;
    dismissal?: string;
};

interface AttendanceGridProps {
    attendance: Record<string, AttendanceRecord[]>;
    onMissingStudent?: (studentId: number, studentName: string) => void;
}

const statusIcons: Record<string, { icon: string; label: string; color: string }> = {
    present: { icon: '✓', label: 'Hadir', color: 'text-green-600 bg-green-50' },
    late: { icon: '⏰', label: 'Terlambat', color: 'text-amber-600 bg-amber-50' },
    absent: { icon: '✗', label: 'Tidak Hadir', color: 'text-red-600 bg-red-50' },
    excused: { icon: '※', label: 'Izin', color: 'text-blue-600 bg-blue-50' },
    bolos: { icon: '⌀', label: 'Bolos', color: 'text-purple-600 bg-purple-50' },
};

export default function AttendanceGrid({ attendance }: AttendanceGridProps) {
    const studentMap = new Map<number, GridData>();

    // Build grid from attendance records grouped by phase
    Object.entries(attendance).forEach(([phase, records]) => {
        records.forEach((record) => {
            const key = record.student_id;
            if (!studentMap.has(key)) {
                studentMap.get(key) ||
                    studentMap.set(key, {
                        student_id: key,
                        student_name: record.student.name,
                    });
            }

            const gridRow = studentMap.get(key);
            if (gridRow) {
                // Map phase names: 'morning' → 'morning', 'class' → 'class', 'dismissal' → 'dismissal'
                const phaseKey = phase === 'subject' ? 'class' : phase;
                (gridRow as any)[phaseKey] = record.status;
            }
        });
    });

    const sortedStudents = Array.from(studentMap.values()).sort((a, b) =>
        a.student_name.localeCompare(b.student_name, 'id-ID'),
    );

    const renderStatusCell = (status?: string) => {
        if (!status) {
            return (
                <div className="px-2 py-1 rounded text-xs text-gray-400 bg-gray-50">—</div>
            );
        }

        const info = statusIcons[status] || { icon: '?', label: status, color: 'text-gray-600 bg-gray-50' };
        return (
            <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${info.color}`} title={info.label}>
                <span>{info.icon}</span>
            </div>
        );
    };

    const calculateStats = () => {
        let total = 0;
        let present = 0;
        let absent = 0;
        let bolos = 0;

        sortedStudents.forEach((row) => {
            ['morning', 'class', 'dismissal'].forEach((phase) => {
                const status = (row as any)[phase];
                if (status) {
                    total++;
                    if (status === 'present') present++;
                    else if (status === 'absent') absent++;
                    else if (status === 'bolos') bolos++;
                }
            });
        });

        return { total, present, absent, bolos };
    };

    const stats = calculateStats();

    return (
        <div className="space-y-4">
            <div className="grid gap-2 md:grid-cols-4 text-xs">
                <div className="rounded border border-border bg-muted/30 px-3 py-2">
                    <p className="text-muted-foreground">Total Catatan</p>
                    <p className="text-lg font-semibold">{stats.total}</p>
                </div>
                <div className="rounded border border-border bg-green-50 px-3 py-2">
                    <p className="text-green-700">Hadir</p>
                    <p className="text-lg font-semibold text-green-600">{stats.present}</p>
                </div>
                <div className="rounded border border-border bg-red-50 px-3 py-2">
                    <p className="text-red-700">Tidak Hadir</p>
                    <p className="text-lg font-semibold text-red-600">{stats.absent}</p>
                </div>
                <div className="rounded border border-border bg-purple-50 px-3 py-2">
                    <p className="text-purple-700">Bolos</p>
                    <p className="text-lg font-semibold text-purple-600">{stats.bolos}</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold">Siswa</th>
                            <th className="px-4 py-2 text-center font-semibold">Pagi</th>
                            <th className="px-4 py-2 text-center font-semibold">Kelas</th>
                            <th className="px-4 py-2 text-center font-semibold">Pulang</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStudents.length > 0 ? (
                            sortedStudents.map((row, idx) => (
                                <tr key={row.student_id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                    <td className="px-4 py-2 font-medium">{row.student_name}</td>
                                    <td className="px-4 py-2 text-center">{renderStatusCell(row.morning)}</td>
                                    <td className="px-4 py-2 text-center">{renderStatusCell(row.class)}</td>
                                    <td className="px-4 py-2 text-center">{renderStatusCell(row.dismissal)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                                    Belum ada catatan absensi.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
                {Object.entries(statusIcons).map(([status, info]) => (
                    <div key={status} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center font-bold ${info.color}`}>
                            {info.icon}
                        </div>
                        <span>{info.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
