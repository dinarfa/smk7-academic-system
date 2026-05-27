import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import admin from '@/routes/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormData = {
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student' | '';
    password: string;
    password_confirmation: string;
};

export default function AdminUsersCreate() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        email: '',
        role: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(admin.users.store.url());
    };

    return (
        <AdminLayout title="Tambah Pengguna">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-8">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                        Manajemen Pengguna
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Tambah Pengguna
                    </h1>
                    <p className="mt-1.5 text-slate-500">
                        Buat akun baru untuk admin, guru, atau siswa.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button asChild variant="outline" className="rounded-xl border-slate-200">
                        <Link href={admin.users.index.url()}>Kembali</Link>
                    </Button>
                </div>
            </div>

            <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                placeholder="Nama lengkap"
                                aria-invalid={Boolean(errors.name)}
                                required
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                placeholder="nama@example.com"
                                aria-invalid={Boolean(errors.email)}
                                required
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={data.role} onValueChange={(value) => setData('role', value as FormData['role'])}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Pilih role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="teacher">Guru</SelectItem>
                                    <SelectItem value="student">Siswa</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                placeholder="Minimal 8 karakter"
                                aria-invalid={Boolean(errors.password)}
                                required
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(event) => setData('password_confirmation', event.target.value)}
                            placeholder="Ulangi password"
                            aria-invalid={Boolean(errors.password_confirmation)}
                            required
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button type="submit" disabled={processing} className="rounded-xl bg-indigo-600 px-6 hover:bg-indigo-700">
                            {processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl border-slate-200">
                            <Link href={admin.users.index.url()}>Batal</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}