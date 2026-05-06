import { Link, useForm } from '@inertiajs/react'
import { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
}

type Props = {
    user: User;
}

export default function AdminResetPassword({ user }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        password: '',
        password_confirmation: '',
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        post(admin.users.resetPassword.store.url({ user: user.id }))
    }

    return (
        <AdminLayout title="Reset Password">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Reset Password</h1>
                    <p className="mt-2 text-muted-foreground">Reset password for {user.name}</p>
                </div>

                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>User Credentials</CardTitle>
                        <CardDescription>Set a new password for this account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label>User</Label>
                                <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3">
                                    <p className="font-medium text-foreground">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Role: {user.role.toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    aria-invalid={Boolean(errors.password)}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    aria-invalid={Boolean(errors.password_confirmation)}
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {processing ? 'Resetting...' : 'Reset Password'}
                                </Button>
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href={admin.users.index.url()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
