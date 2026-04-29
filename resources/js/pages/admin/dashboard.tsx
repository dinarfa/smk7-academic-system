import { Link } from '@inertiajs/react'

export default function AdminDashboard({ summary }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">System overview and statistics</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Total Users */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total_users}</p>
                        </div>
                        <div className="text-3xl text-blue-500">👥</div>
                    </div>
                </div>

                {/* Teachers */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Teachers</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total_teachers}</p>
                        </div>
                        <div className="text-3xl text-green-500">🎓</div>
                    </div>
                </div>

                {/* Students */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Students</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total_students}</p>
                        </div>
                        <div className="text-3xl text-purple-500">📚</div>
                    </div>
                </div>

                {/* Sessions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Sessions</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total_sessions}</p>
                        </div>
                        <div className="text-3xl text-orange-500">📅</div>
                    </div>
                </div>

                {/* Today Records */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Today Records</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{summary.today_records}</p>
                        </div>
                        <div className="text-3xl text-red-500">📊</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/admin/users"
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium"
                    >
                        Manage Users
                    </Link>
                    <Link
                        href="/admin/classes"
                        className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center font-medium"
                    >
                        Generate Classes
                    </Link>
                    <Link
                        href="/admin/reports/overview"
                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-medium"
                    >
                        View Reports
                    </Link>
                    <Link
                        href="/admin/reports/by-session"
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center font-medium"
                    >
                        By Session
                    </Link>
                    <Link
                        href="/admin/audit-logs"
                        className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-center font-medium"
                    >
                        Audit Logs
                    </Link>
                </div>
            </div>
        </div>
    )
}
