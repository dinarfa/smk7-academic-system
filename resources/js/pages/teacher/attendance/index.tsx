import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import QRScanner from '@/components/QRScanner';
import { route } from '@inertiajs/react';

interface AttendanceRecord {
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
}

interface ActiveSession {
    id: number;
    qr_token: string;
    type: string;
    ends_at: string;
}

interface DailyAttendanceData {
    attendance: Record<string, AttendanceRecord[]>;
    active_session: ActiveSession | null;
    date: string;
}

export default function Index({ attendance, activeSession, date }: DailyAttendanceData) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getTimeRemaining = (endTime: string) => {
        const end = new Date(endTime);
        const diff = end.getTime() - currentTime.getTime();

        if (diff <= 0) return 'Expired';

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'text-green-600 bg-green-100';
            case 'late': return 'text-yellow-600 bg-yellow-100';
            case 'absent': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const phases = ['morning', 'class', 'dismissal'];

    return (
        <>
            <Head title="Daily Attendance" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Daily Attendance</h1>
                    <p className="mt-2 text-gray-600">Manage student attendance for {date}</p>
                </div>

                {/* Active Session Section */}
                {activeSession && (
                    <div className="bg-white shadow rounded-lg p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Active Session</h2>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                    {getTimeRemaining(activeSession.ends_at)}
                                </div>
                                <div className="text-sm text-gray-500">Time remaining</div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* QR Code Display */}
                            <div className="text-center">
                                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                                    <img
                                        src={`/api/qr/${activeSession.qr_token}`}
                                        alt="QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    {activeSession.type} session
                                </p>
                            </div>

                            {/* Session Controls */}
                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowScanner(!showScanner)}
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    {showScanner ? 'Hide Scanner' : 'Test Scanner'}
                                </button>

                                <button
                                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Generate New QR
                                </button>

                                <button
                                    className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Close Session
                                </button>
                            </div>
                        </div>

                        {/* QR Scanner */}
                        {showScanner && (
                            <div className="mt-6">
                                <QRScanner
                                    onScan={(data) => {
                                        console.log('Scanned:', data);
                                        // TODO: Process scan
                                    }}
                                    onError={(error) => {
                                        console.error('Scan error:', error);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Attendance by Phase */}
                <div className="space-y-6">
                    {phases.map(phase => (
                        <div key={phase} className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 capitalize">
                                {phase} Attendance
                            </h3>

                            {attendance[phase]?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Source
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {attendance[phase].map(record => (
                                                <tr key={record.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {record.student.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(record.status)}`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(record.scanned_at).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {record.source}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No attendance records for {phase}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Manual Attendance Section */}
                <div className="bg-white shadow rounded-lg p-6 mt-8">
                    <h3 className="text-lg font-semibold mb-4">Manual Attendance</h3>
                    <p className="text-gray-600 mb-4">
                        Use this when QR scanning is not available or for bulk updates.
                    </p>
                    <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                        Open Manual Checklist
                    </button>
                </div>
            </div>
        </>
    );
}