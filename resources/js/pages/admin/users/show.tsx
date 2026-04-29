import { Link } from '@inertiajs/react'

export default function AdminUserShow({ user, auditLogs }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="mt-2 text-gray-600">User profile and activity</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* User Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">User Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="text-lg font-medium text-gray-900">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-lg font-medium text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Role</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getRoleBadgeClass(user.role)}`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created At</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <Link
                                href={`/admin/users/${user.id}/reset-password`}
                                className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition font-medium"
                            >
                                Reset Password
                            </Link>
                            <Link
                                href="/admin/users"
                                className="block w-full px-4 py-2 bg-gray-200 text-gray-800 text-center rounded-lg hover:bg-gray-300 transition font-medium"
                            >
                                Back to Users
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Audit Logs */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Log</h2>
                        <div className="space-y-4">
                            {auditLogs.length === 0 ? (
                                <p className="text-gray-600 text-center py-8">No activity recorded</p>
                            ) : (
                                auditLogs.map((log) => (
                                    <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {log.action.replace(/_/g, ' ').toUpperCase()}
                                                </p>
                                                <p className="text-sm text-gray-600">{log.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    By: {log.admin_name}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getRoleBadgeClass(role) {
    switch (role) {
        case 'admin':
            return 'bg-red-100 text-red-800'
        case 'teacher':
            return 'bg-blue-100 text-blue-800'
        case 'student':
            return 'bg-green-100 text-green-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}
