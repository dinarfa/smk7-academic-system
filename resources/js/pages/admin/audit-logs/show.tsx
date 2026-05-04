import { Link } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

export default function AdminAuditLogShow({ log }) {
    return (
        <AdminLayout title="Audit Log Details">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Audit Log Details</h1>
                    <p className="mt-2 text-muted-foreground">Detailed information about this action</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Action Information</CardTitle>
                                <CardDescription>Context for the recorded activity.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                        <p className="text-sm text-muted-foreground">Action</p>
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200">
                                            {log.action.replace(/_/g, ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                        <p className="text-sm text-muted-foreground">Performed At</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Description</p>
                                        <p className="text-sm font-medium text-foreground text-right">{log.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-base font-semibold text-foreground">Admin Information</h3>
                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="text-sm font-medium text-foreground">{log.admin_name}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium text-foreground">{log.admin_email}</p>
                                    </div>
                                </div>

                                {log.target_user_name && (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-foreground">Target User</h3>
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <p className="text-sm text-muted-foreground">Name</p>
                                            <p className="text-sm font-medium text-foreground">{log.target_user_name}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="text-sm font-medium text-foreground">{log.target_user_email}</p>
                                        </div>
                                    </div>
                                )}

                                {log.model_type && (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-foreground">Affected Model</h3>
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <p className="text-sm text-muted-foreground">Model Type</p>
                                            <p className="text-sm font-medium text-foreground text-right">{log.model_type}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Model ID</p>
                                            <p className="text-sm font-medium text-foreground">{log.model_id}</p>
                                        </div>
                                    </div>
                                )}

                                {(log.old_values || log.new_values) && (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-foreground">Changes</h3>
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            {log.old_values && (
                                                <div className="rounded-lg border border-rose-200/60 bg-rose-50/60 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                                                    <p className="mb-2 text-sm font-medium text-rose-900 dark:text-rose-200">Old Values</p>
                                                    <pre className="overflow-auto text-xs text-rose-800 dark:text-rose-200">
                                                        {JSON.stringify(log.old_values, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                            {log.new_values && (
                                                <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                                    <p className="mb-2 text-sm font-medium text-emerald-900 dark:text-emerald-200">New Values</p>
                                                    <pre className="overflow-auto text-xs text-emerald-800 dark:text-emerald-200">
                                                        {JSON.stringify(log.new_values, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Navigate back to the logs list.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href={admin.auditLogs.index.url()}>Back to Logs</Link>
                                </Button>

                                <div className="border-t border-border pt-6">
                                    <h3 className="mb-2 text-sm font-medium text-foreground">Log ID</h3>
                                    <p className="text-sm text-muted-foreground break-all">{log.id}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
