import { Link } from '@inertiajs/react'

export default function AdminReportsBySession({ sessions }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance by Session</h1>
                    <p className="mt-2 text-gray-600">View attendance records grouped by class/session</p>
                </div>
                <Link
                    href="/admin/reports/overview"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                    Back to Overview
                </Link>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
                {sessions.data.map((session) => (
                    <div key={session.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{session.subject}</h3>
                                <p className="text-sm text-gray-600">Type: {session.type}</p>
                                <p className="text-sm text-gray-600">Opened by: {session.opened_by}</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(session.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">{session.records_count}</p>
                                <p className="text-sm text-gray-600">attendees</p>
                                <p className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                                    session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {session.is_active ? 'Active' : 'Closed'}
                                </p>
                            </div>
                        </div>

                        {/* Attendance Records */}
                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-2">Attendance Records</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Student</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Email</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Scanned At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {session.records.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-3 text-center text-gray-600">
                                                    No attendance records
                                                </td>
                                            </tr>
                                        ) : (
                                            session.records.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                                                        {record.student_name}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                        {record.student_email}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            record.status === 'present'
                                                                ? 'bg-green-100 text-green-800'
                                                                : record.status === 'late'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                        {new Date(record.scanned_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-lg shadow px-6 py-3 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                    {sessions.prev_page_url && (
                        <Link
                            href={sessions.prev_page_url}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Previous
                        </Link>
                    )}
                    {sessions.next_page_url && (
                        <Link
                            href={sessions.next_page_url}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Next
                        </Link>
                    )}
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{sessions.current_page}</span> of{' '}
                        <span className="font-medium">{sessions.last_page}</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
