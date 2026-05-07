import { useState } from 'react';
import { route } from '@inertiajs/react';

interface Student {
    id: number;
    name: string;
}

interface ManualChecklistProps {
    students: Student[];
    sessionId: number;
    phase: string;
    onClose: () => void;
}

export default function ManualChecklist({ students, sessionId, phase, onClose }: ManualChecklistProps) {
    const [selectedStudents, setSelectedStudents] = useState<Record<number, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = (studentId: number, status: string) => {
        setSelectedStudents(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleMarkAll = (status: string) => {
        const newSelections: Record<number, string> = {};
        filteredStudents.forEach(student => {
            newSelections[student.id] = status;
        });
        setSelectedStudents(prev => ({
            ...prev,
            ...newSelections
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const attendanceData = Object.entries(selectedStudents).map(([studentId, status]) => ({
            student_id: parseInt(studentId),
            status
        }));

        try {
            const response = await fetch(route('teacher.attendance.manual'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    phase,
                    students: attendanceData
                })
            });

            if (response.ok) {
                // Success - close modal and refresh
                onClose();
                window.location.reload();
            } else {
                console.error('Failed to submit attendance');
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCount = Object.keys(selectedStudents).length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Manual Attendance</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-gray-600 mt-1">
                        Mark attendance for {phase} session. {selectedCount} students selected.
                    </p>
                </div>

                <div className="px-6 py-4">
                    {/* Search and Bulk Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleMarkAll('present')}
                                className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                            >
                                Mark All Present
                            </button>
                            <button
                                onClick={() => handleMarkAll('absent')}
                                className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Mark All Absent
                            </button>
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                        {filteredStudents.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No students found
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredStudents.map(student => (
                                    <div key={student.id} className="p-4 flex items-center justify-between">
                                        <span className="font-medium">{student.name}</span>
                                        <div className="flex gap-2">
                                            {['present', 'late', 'absent'].map(status => (
                                                <label key={status} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`student-${student.id}`}
                                                        value={status}
                                                        checked={selectedStudents[student.id] === status}
                                                        onChange={() => handleStatusChange(student.id, status)}
                                                        className="mr-1"
                                                    />
                                                    <span className="text-sm capitalize">{status}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={selectedCount === 0 || isSubmitting}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : `Save ${selectedCount} Records`}
                    </button>
                </div>
            </div>
        </div>
    );
}