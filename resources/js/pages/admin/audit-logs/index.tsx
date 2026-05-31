import { Head, Link, router } from '@inertiajs/react';
import { ScrollText, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import admin from '@/routes/admin';

type AuditLog = {
    id: number;
    admin_name: string;
    admin_email: string;
    action: string;
    target_user_name: string | null;
    target_user_email: string | null;
    description: string;
    created_at: string;
};

type Admin = {
    id: number;
    name: string;
};

type Props = {
    logs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    admins?: Admin[];
    actions?: string[];
    filters?: {
        filter_action?: string;
        filter_admin_id?: string;
        search?: string;
        start_date?: string;
        end_date?: string;
    };
};

export default function AdminAuditLogsIndex({
    logs,
    admins,
    actions,
    filters,
}: Props) {
    const [filterAction, setFilterAction] = useState(
        filters?.filter_action ?? '',
    );
    const [filterAdmin, setFilterAdmin] = useState(
        filters?.filter_admin_id ?? '',
    );
    const [search, setSearch] = useState(filters?.search ?? '');
    const [startDate, setStartDate] = useState(filters?.start_date ?? '');
    const [endDate, setEndDate] = useState(filters?.end_date ?? '');

    function handleFilter() {
        const params: Record<string, string> = {};

        if (filterAction && filterAction !== 'all') {
            params.filter_action = filterAction;
        }

        if (filterAdmin && filterAdmin !== 'all') {
            params.filter_admin_id = filterAdmin;
        }

        if (search) {
            params.search = search;
        }

        if (startDate) {
            params.start_date = startDate;
        }

        if (endDate) {
            params.end_date = endDate;
        }

        router.get(admin.auditLogs.index.url(), params, {
            preserveState: true,
        });
    }

    return (
        <>
            <Head title="Log Audit" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Log Audit
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lacak semua aksi admin dan aktivitas sistem
                        </p>
                    </div>
                    <Button asChild variant="secondary" size="sm">
                        <Link href={admin.dashboard.url()}>Kembali</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Aksi
                        </label>
                        <Select
                            value={filterAction}
                            onValueChange={setFilterAction}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Aksi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Aksi</SelectItem>
                                {actions?.map((action) => (
                                    <SelectItem key={action} value={action}>
                                        {action
                                            .replace(/_/g, ' ')
                                            .toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Admin
                        </label>
                        <Select
                            value={filterAdmin}
                            onValueChange={setFilterAdmin}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Admin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Admin</SelectItem>
                                {admins?.map((adminUser) => (
                                    <SelectItem
                                        key={adminUser.id}
                                        value={String(adminUser.id)}
                                    >
                                        {adminUser.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Cari
                        </label>
                        <Input
                            placeholder="Cari deskripsi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-56"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Dari Tanggal
                        </label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-40"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Sampai Tanggal
                        </label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-40"
                        />
                    </div>
                    <Button onClick={handleFilter} size="sm">
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tabel Aktivitas</CardTitle>
                        <CardDescription>
                            Review aksi admin dan event sistem terbaru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {logs.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <ScrollText className="h-10 w-10 text-muted-foreground/50" />
                                <h3 className="mt-4 text-sm font-medium text-foreground">
                                    Belum Ada Log
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Aktivitas admin dan event sistem akan muncul
                                    di sini.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-border">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground"
                                                >
                                                    Admin
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground"
                                                >
                                                    Aksi
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground"
                                                >
                                                    Pengguna Target
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground"
                                                >
                                                    Deskripsi
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground"
                                                >
                                                    Tanggal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {logs.data.map((log) => (
                                                <tr
                                                    key={log.id}
                                                    className="hover:bg-muted/40"
                                                >
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                {log.admin_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    log.admin_email
                                                                }
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <Badge variant="outline">
                                                            {log.action
                                                                ? log.action
                                                                      .replace(
                                                                          /_/g,
                                                                          ' ',
                                                                      )
                                                                      .toUpperCase()
                                                                : '-'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        {log.target_user_name ? (
                                                            <div>
                                                                <p className="font-medium text-foreground">
                                                                    {
                                                                        log.target_user_name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        log.target_user_email
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="max-w-xs truncate px-6 py-4 text-sm text-muted-foreground">
                                                        {log.description}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">
                                                        {new Date(
                                                            log.created_at,
                                                        ).toLocaleDateString(
                                                            'id-ID',
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between border-t border-border px-6 py-3">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        {logs.prev_page_url && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Link href={logs.prev_page_url}>
                                                    Sebelumnya
                                                </Link>
                                            </Button>
                                        )}
                                        {logs.next_page_url && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="ml-3"
                                            >
                                                <Link href={logs.next_page_url}>
                                                    Selanjutnya
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Halaman{' '}
                                            <span className="font-medium text-foreground">
                                                {logs.current_page}
                                            </span>{' '}
                                            dari{' '}
                                            <span className="font-medium text-foreground">
                                                {logs.last_page}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminAuditLogsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard.url() },
        { title: 'Log Audit', href: admin.auditLogs.index.url() },
    ],
};
