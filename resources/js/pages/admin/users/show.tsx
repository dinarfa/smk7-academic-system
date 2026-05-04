import { Link } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

export default function AdminUserShow({ user, auditLogs }) {
    return (
        <AdminLayout title="User Details">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">{user.name}</h1>
                    <p className="mt-2 text-muted-foreground">User profile and activity</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                                <CardDescription>Key account details and role.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="text-lg font-medium text-foreground">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="text-lg font-medium text-foreground">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <Badge className={`mt-1 ${getRoleBadgeClass(user.role)}`}>
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="text-lg font-medium text-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="pt-2 space-y-2">
                                    <Button asChild className="w-full">
                                        <Link href={admin.users.resetPassword.url({ user: user.id })}>Reset Password</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={admin.users.index.url()}>Back to Users</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Log</CardTitle>
                                <CardDescription>Recent actions tied to this user.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {auditLogs.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">No activity recorded</p>
                                ) : (
                                    auditLogs.map((log) => (
                                        <div key={log.id} className="border-l-4 border-primary/60 pl-4 py-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {log.action.replace(/_/g, ' ').toUpperCase()}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{log.description}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        By: {log.admin_name}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function getRoleBadgeClass(role) {
    switch (role) {
        case 'admin':
            return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200'
        case 'teacher':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200'
        case 'student':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
        default:
            return 'bg-muted text-muted-foreground'
    }
}
