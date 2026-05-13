import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';

type MissingEntry = {
    session_id: number;
    session_type: string;
    session_subject: string | null;
    student_id: number;
    student_name: string | null;
};

export default function BolosSummary() {
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState<boolean>(false);
    const [summary, setSummary] = useState<any>(null);

    const getCsrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/teacher/attendance/bolos-summary?date=${date}`, {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setSummary(json.summary ?? json);
        } catch (err) {
            console.error(err);
            alert('Failed to load summary');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [date]);

    const handleExport = async () => {
        try {
            const response = await fetch('/teacher/attendance/export', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/csv',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(getCsrfToken() ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
                },
                body: JSON.stringify({ startDate: date, endDate: date }),
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bolos-summary-${date}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Export failed');
        }
    };

    return (
        <div className="p-4">
            <Head title="Bolos Summary" />
            <div className="mb-4 flex items-center gap-4">
                <h1 className="text-xl font-bold">Bolos Summary</h1>
                <div>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded px-2 py-1" />
                </div>
                <button onClick={fetchSummary} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
                <button onClick={handleExport} className="px-3 py-1 bg-green-600 text-white rounded">Export CSV</button>
            </div>

            {loading && <p>Loading…</p>}

            {summary && (
                <div className="bg-white shadow rounded p-4">
                    <p className="text-sm text-gray-600 mb-2">Missing: {summary.missing_count} — Expected students: {summary.expected_students}</p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Student</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Student ID</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Session</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.missing.map((m: MissingEntry) => (
                                    <tr key={`${m.session_id}-${m.student_id}`}>
                                        <td className="px-4 py-2">{m.student_name}</td>
                                        <td className="px-4 py-2">{m.student_id}</td>
                                        <td className="px-4 py-2">{m.session_subject ?? '-'}</td>
                                        <td className="px-4 py-2 capitalize">{m.session_type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
