import { Link } from '@inertiajs/react'

export default function AdminReportsByStudent({ students }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance by Student</h1>
                    <p className="mt-2 text-gray-600">View each student's attendance history</p>
                </div>
                <Link
                    href="/admin/reports/overview"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                    Back to Overview
                </Link>
            </div>

            {/* Students List */}
            <div className="space-y-4">
                {students.data.map((student) => (
                    <div key={student.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                                <p className="text-sm text-gray-600">{student.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">{student.records_count}</p>
                                <p className="text-sm text-gray-600">total records</p>
                            </div>
                        </div>

                        {/* Student's Records */}
                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-2">Attendance History</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Session</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Type</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Subject</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {student.records.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-3 text-center text-gray-600">
                                                    No attendance records
                                                </td>
                                            </tr>
                                        ) : (
                                            student.records.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                        {record.session_subject}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                        {record.session_type}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                        {record.session_subject}
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
                    {students.prev_page_url && (
                        <Link
                            href={students.prev_page_url}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Previous
                        </Link>
                    )}
                    {students.next_page_url && (
                        <Link
                            href={students.next_page_url}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Next
                        </Link>
                    )}
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{students.current_page}</span> of{' '}
                        <span className="font-medium">{students.last_page}</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
