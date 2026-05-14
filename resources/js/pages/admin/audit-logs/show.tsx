import { Link } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLayout from '@/layouts/AdminLayout'
import admin from '@/routes/admin'

type AuditLog = {
    id: number;
    admin_name: string;
    admin_email: string;
    action: string;
    target_user_name: string | null;
    target_user_email: string | null;
    description: string;
    created_at: string;
    model_type: string | null;
    model_id: string | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
}

type Props = {
    log: AuditLog;
}

export default function AdminAuditLogShow({ log }: Props) {
    return (
        <AdminLayout title="Detail Log Audit">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Detail Log Audit</h1>
                    <p className="text-muted-foreground">Informasi detail tentang aksi ini</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Aksi</CardTitle>
                                <CardDescription>Konteks aktivitas yang tercatat.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                        <p className="text-sm text-muted-foreground">Aksi</p>
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200">
                                            {log.action.replace(/_/g, ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                        <p className="text-sm text-muted-foreground">Dilakukan Pada</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Deskripsi</p>
                                        <p className="text-sm font-medium text-foreground text-right">{log.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-base font-semibold text-foreground">Informasi Admin</h3>
                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                        <p className="text-sm text-muted-foreground">Nama</p>
                                        <p className="text-sm font-medium text-foreground">{log.admin_name}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium text-foreground">{log.admin_email}</p>
                                    </div>
                                </div>

                                {log.target_user_name && (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-foreground">Pengguna Target</h3>
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <p className="text-sm text-muted-foreground">Nama</p>
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
                                        <h3 className="text-base font-semibold text-foreground">Model Terdampak</h3>
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <p className="text-sm text-muted-foreground">Tipe Model</p>
                                            <p className="text-sm font-medium text-foreground text-right">{log.model_type}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">ID Model</p>
                                            <p className="text-sm font-medium text-foreground">{log.model_id}</p>
                                        </div>
                                    </div>
                                )}

                                {(log.old_values || log.new_values) && (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-foreground">Perubahan</h3>
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            {log.old_values && (
                                                <div className="rounded-lg border border-rose-200/60 bg-rose-50/60 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                                                    <p className="mb-2 text-sm font-medium text-rose-900 dark:text-rose-200">Nilai Lama</p>
                                                    <pre className="overflow-auto text-xs text-rose-800 dark:text-rose-200">
                                                        {JSON.stringify(log.old_values, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                            {log.new_values && (
                                                <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                                    <p className="mb-2 text-sm font-medium text-emerald-900 dark:text-emerald-200">Nilai Baru</p>
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
                                <CardTitle>Aksi Cepat</CardTitle>
                                <CardDescription>Kembali ke daftar log.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href={admin.auditLogs.index.url()}>Kembali ke Log</Link>
                                </Button>

                                <div className="border-t border-border pt-6">
                                    <h3 className="mb-2 text-sm font-medium text-foreground">ID Log</h3>
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
