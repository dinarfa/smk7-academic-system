import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import admin from '@/routes/admin';

export default function AdminUsersIndex({ users }) {
    return (
        <AdminLayout title="User Management">
            <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold text-foreground">User Management</h1>
                <p className="mt-2 text-muted-foreground">Manage all users in the system</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>All registered users and quick actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex justify-end">
                        <Button asChild>
                            <Link href={admin.reports.overview.url()}>View Reports</Link>
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/40">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Badge className={getRoleBadgeClass(user.role)}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <Button asChild variant="link" className="h-auto p-0">
                                                <Link href={admin.users.show.url({ user: user.id })}>View</Link>
                                            </Button>
                                            <Button asChild variant="link" className="h-auto p-0 text-emerald-600 dark:text-emerald-400">
                                                <Link href={admin.users.resetPassword.url({ user: user.id })}>Reset Password</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Page <span className="font-medium text-foreground">{users.current_page}</span> of <span className="font-medium text-foreground">{users.last_page}</span></p>
                        <div className="flex gap-3">
                            {users.prev_page_url && <Link href={users.prev_page_url} className="text-primary hover:underline">Previous</Link>}
                            {users.next_page_url && <Link href={users.next_page_url} className="text-primary hover:underline">Next</Link>}
                        </div>
                    </div>
                </CardContent>
            </Card>
            </div>
        </AdminLayout>
    );
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
