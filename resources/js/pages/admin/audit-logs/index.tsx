import { Link } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

export default function AdminAuditLogsIndex({ logs }) {
    return (
        <AdminLayout title="Audit Logs">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Audit Logs</h1>
                        <p className="mt-2 text-muted-foreground">Track all admin actions and system activities</p>
                    </div>
                    <Button asChild variant="secondary">
                        <Link href={admin.dashboard.url()}>Back to Dashboard</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity Table</CardTitle>
                        <CardDescription>Review recent admin actions and system events.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Admin
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Target User
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/40">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div>
                                                    <p className="font-medium text-foreground">{log.admin_name}</p>
                                                    <p className="text-xs text-muted-foreground">{log.admin_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200">
                                                    {log.action.replace(/_/g, ' ').toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {log.target_user_name ? (
                                                    <div>
                                                        <p className="font-medium text-foreground">{log.target_user_name}</p>
                                                        <p className="text-xs text-muted-foreground">{log.target_user_email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                                                {log.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Button asChild variant="link" className="h-auto p-0">
                                                    <Link href={admin.auditLogs.show.url({ auditLog: log.id })}>View</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between border-t border-border px-6 py-3">
                            <div className="flex flex-1 justify-between sm:hidden">
                                {logs.prev_page_url && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={logs.prev_page_url}>Previous</Link>
                                    </Button>
                                )}
                                {logs.next_page_url && (
                                    <Button asChild variant="outline" size="sm" className="ml-3">
                                        <Link href={logs.next_page_url}>Next</Link>
                                    </Button>
                                )}
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Page <span className="font-medium text-foreground">{logs.current_page}</span> of{' '}
                                    <span className="font-medium text-foreground">{logs.last_page}</span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
