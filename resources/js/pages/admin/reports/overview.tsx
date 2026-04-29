import { Link } from '@inertiajs/react'

export default function AdminReportsOverview({ summary, topStudents, recentSessions }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports Overview</h1>
                    <p className="mt-2 text-gray-600">System statistics and attendance data</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin/reports/by-session"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                    >
                        By Session
                    </Link>
                    <Link
                        href="/admin/reports/export"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                    >
                        Export CSV
                    </Link>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <StatCard label="Total Users" value={summary.total_users} icon="👥" color="blue" />
                <StatCard label="Teachers" value={summary.total_teachers} icon="🎓" color="green" />
                <StatCard label="Students" value={summary.total_students} icon="📚" color="purple" />
                <StatCard label="Sessions" value={summary.total_sessions} icon="📅" color="orange" />
                <StatCard label="Total Records" value={summary.total_records} icon="📊" color="red" />
                <StatCard label="Today Records" value={summary.today_records} icon="✅" color="indigo" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Students */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Students by Attendance</h2>
                    <div className="space-y-3">
                        {topStudents.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">No attendance data</p>
                        ) : (
                            topStudents.map((student, index) => (
                                <div key={student.student_id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                    <div>
                                        <p className="font-medium text-gray-900">#{index + 1} {student.student_name}</p>
                                        <p className="text-sm text-gray-600">{student.student_email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">{student.attendance_count}</p>
                                        <p className="text-xs text-gray-500">attendance</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Sessions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Sessions</h2>
                    <div className="space-y-3">
                        {recentSessions.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">No sessions yet</p>
                        ) : (
                            recentSessions.map((session) => (
                                <div key={session.id} className="py-2 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{session.subject}</p>
                                            <p className="text-sm text-gray-600">{session.type}</p>
                                            <p className="text-xs text-gray-500">by {session.opened_by}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {session.is_active ? 'Active' : 'Closed'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/admin/reports/by-student"
                        className="px-4 py-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition text-center font-medium"
                    >
                        View by Student
                    </Link>
                    <Link
                        href="/admin/users"
                        className="px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition text-center font-medium"
                    >
                        Manage Users
                    </Link>
                    <Link
                        href="/admin/audit-logs"
                        className="px-4 py-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition text-center font-medium"
                    >
                        Audit Logs
                    </Link>
                    <Link
                        href="/admin/dashboard"
                        className="px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition text-center font-medium"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`text-3xl ${colorClasses[color]}`}>{icon}</div>
            </div>
        </div>
    )
}
