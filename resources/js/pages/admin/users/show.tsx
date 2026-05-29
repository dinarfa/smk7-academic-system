import { Head, Link } from '@inertiajs/react';
import { Key, Shield, CalendarDays, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import admin from '@/routes/admin';

type UserData = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
};

type AuditLog = {
    id: number;
    action: string;
    description: string;
    admin_name: string;
    created_at: string;
};

type Props = {
    user: UserData;
    auditLogs: AuditLog[];
};

export default function AdminUserShow({ user, auditLogs }: Props) {
    const getRoleVariant = (
        role: string,
    ): 'default' | 'secondary' | 'outline' => {
        switch (role) {
            case 'admin':
                return 'default';
            case 'teacher':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <>
            <Head title={`Detail User: ${user.name}`} />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Detail Pengguna
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lihat profil pengguna dan log aktivitasnya.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={admin.users.index.url()}>
                            Kembali ke Daftar
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-1">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
                                        {user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()}
                                    </div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        {user.name}
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {user.email}
                                    </p>
                                    <Badge
                                        variant={getRoleVariant(user.role)}
                                        className="mt-3"
                                    >
                                        {user.role}
                                    </Badge>

                                    <div className="mt-6 w-full space-y-3 text-left">
                                        <div className="flex items-center gap-3">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    ID Pengguna
                                                </p>
                                                <p className="text-sm font-medium text-foreground">
                                                    #{user.id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Terdaftar Pada
                                                </p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {new Date(
                                                        user.created_at,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Key className="h-4 w-4" />
                                    Keamanan Akun
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Jika pengguna lupa kata sandinya, Anda dapat
                                    memaksanya mengubah kata sandi baru.
                                </p>
                                <Button
                                    asChild
                                    variant="destructive"
                                    className="w-full"
                                >
                                    <Link
                                        href={admin.users.resetPassword.url({
                                            user: user.id,
                                        })}
                                    >
                                        Reset Password Pengguna
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="flex h-full flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Log Aktivitas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {auditLogs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <History className="mb-3 h-10 w-10 text-muted-foreground" />
                                        <p className="text-sm font-medium text-foreground">
                                            Belum ada aktivitas tercatat
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Aktivitas admin terkait akun ini
                                            akan muncul di sini.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {auditLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="relative border-l border-border pb-4 pl-6 last:border-0 last:pb-0"
                                            >
                                                <div className="absolute top-[4px] left-[-5px] h-2.5 w-2.5 rounded-full border-2 border-background bg-primary"></div>
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="text-xs font-medium text-primary uppercase">
                                                            {log.action.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                        </p>
                                                        <p className="mt-0.5 text-sm font-medium text-foreground">
                                                            {log.description}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Oleh:{' '}
                                                            <span className="font-medium text-foreground">
                                                                {log.admin_name}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 text-xs text-muted-foreground">
                                                        {new Date(
                                                            log.created_at,
                                                        ).toLocaleDateString(
                                                            'id-ID',
                                                            {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminUserShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Kelola Pengguna', href: admin.users.index.url() },
        { title: 'Detail', href: '#' },
    ],
};
