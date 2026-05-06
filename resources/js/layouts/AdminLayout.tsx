import { Link } from '@inertiajs/react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { home } from '@/routes'
import admin from '@/routes/admin'

export default function AdminLayout({ children, title = 'Admin' }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={admin.dashboard.url()} className="text-lg font-semibold text-foreground">{title}</Link>
            <nav className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
              <Link href={admin.users.index.url()} className="hover:text-foreground">Users</Link>
              <Link href={admin.classes.index.url()} className="hover:text-foreground">Classes</Link>
              <Link href={admin.subjects.index.url()} className="hover:text-foreground">Subjects</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href={home.url()}>
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href={admin.reports.overview.url()}>
              <Button variant="secondary">Reports</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">{children}</div>
      </main>

      <footer className="border-t border-border py-4 mt-8 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4">© {new Date().getFullYear()} SMK7 Academic System</div>
      </footer>
    </div>
  )
}
