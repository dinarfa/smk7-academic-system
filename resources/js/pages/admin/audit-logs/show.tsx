import { Link } from '@inertiajs/react'

export default function AdminAuditLogShow({ log }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Audit Log Details</h1>
                <p className="mt-2 text-gray-600">Detailed information about this action</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        {/* Action Info */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Action Information</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between pb-3 border-b">
                                    <p className="text-gray-600">Action</p>
                                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {log.action.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pb-3 border-b">
                                    <p className="text-gray-600">Performed At</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(log.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-600">Description</p>
                                    <p className="text-gray-900 font-medium text-right">{log.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Admin Info */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Information</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between pb-3 border-b">
                                    <p className="text-gray-600">Name</p>
                                    <p className="text-gray-900 font-medium">{log.admin_name}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-600">Email</p>
                                    <p className="text-gray-900 font-medium">{log.admin_email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Target User Info */}
                        {log.target_user_name && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Target User</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between pb-3 border-b">
                                        <p className="text-gray-600">Name</p>
                                        <p className="text-gray-900 font-medium">{log.target_user_name}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-600">Email</p>
                                        <p className="text-gray-900 font-medium">{log.target_user_email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Model Info */}
                        {log.model_type && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Affected Model</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between pb-3 border-b">
                                        <p className="text-gray-600">Model Type</p>
                                        <p className="text-gray-900 font-medium text-right">{log.model_type}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-600">Model ID</p>
                                        <p className="text-gray-900 font-medium">{log.model_id}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Changes */}
                        {(log.old_values || log.new_values) && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Changes</h2>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {log.old_values && (
                                        <div className="bg-red-50 p-4 rounded">
                                            <p className="text-sm font-medium text-red-900 mb-2">Old Values</p>
                                            <pre className="text-xs text-red-800 overflow-auto">
                                                {JSON.stringify(log.old_values, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    {log.new_values && (
                                        <div className="bg-green-50 p-4 rounded">
                                            <p className="text-sm font-medium text-green-900 mb-2">New Values</p>
                                            <pre className="text-xs text-green-800 overflow-auto">
                                                {JSON.stringify(log.new_values, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link
                                href="/admin/audit-logs"
                                className="block w-full px-4 py-2 bg-gray-200 text-gray-800 text-center rounded-lg hover:bg-gray-300 transition font-medium"
                            >
                                Back to Logs
                            </Link>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <h3 className="font-medium text-gray-900 mb-3">Log ID</h3>
                            <p className="text-sm text-gray-600 break-all">{log.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
