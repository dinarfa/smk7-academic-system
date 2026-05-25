import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import admin from '@/routes/admin';

const NAV_ITEMS = [
    { href: admin.users.index.url(), label: 'Pengguna' },
    { href: admin.classes.index.url(), label: 'Kelas' },
    { href: admin.subjects.index.url(), label: 'Mapel' },
    { href: admin.schedules.index.url(), label: 'Jadwal' },
] as const;

export default function AdminLayout({ children, title = 'Admin' }: { children: React.ReactNode; title?: string }) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
            <Head title={title} />

            <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-8">
                        <Link
                            href={admin.dashboard.url()}
                            className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-bold tracking-tight text-transparent"
                        >
                            SMK7 Admin
                        </Link>
                        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                            {NAV_ITEMS.map((item) => {
                                const isActive = url.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={
                                            isActive
                                                ? 'text-indigo-600 font-semibold'
                                                : 'text-slate-600 transition-colors hover:text-indigo-600'
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

          <div className="flex items-center gap-3">
            <Link href={home.url()}>
              <Button variant="ghost" className="rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600">
                Beranda
              </Button>
            </Link>
            <Link href={admin.reports.overview.url()}>
              <Button className="rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700">
                Laporan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="space-y-8">{children}</div>
      </main>

      <footer className="mt-12 py-6 text-center text-sm font-medium text-slate-400">
        <div className="mx-auto max-w-7xl px-4">
          © {new Date().getFullYear()} Sistem Akademik SMK7
        </div>
      </footer>
    </div>
  );
}
