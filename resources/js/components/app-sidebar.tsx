import { Link, usePage } from '@inertiajs/react';
import {
    BookOpenCheck,
    CalendarDays,
    Layers,
    LayoutGrid,
    PenLine,
    QrCode,
    School,
    Users,
    BookText,
    ScrollText,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import type { NavSection } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import student from '@/routes/student';
import teacher from '@/routes/teacher';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth.user as
        | {
            role?: 'admin' | 'teacher' | 'student';
            homeroom_classes_count?: number;
        }
        | undefined;
    const role = user?.role;
    const dashboardHref =
        role === 'teacher'
            ? teacher.dashboard.url()
            : role === 'student'
                ? student.dashboard.url()
                : role === 'admin'
                    ? admin.dashboard.url()
                    : dashboard();

    const dashboardItem: NavItem = {
        title: 'Dashboard',
        href: dashboardHref,
        icon: LayoutGrid,
    };

    const sections: NavSection[] = [];

    if (role === 'teacher') {
        const canSeeHomeroomClassMenu = (user?.homeroom_classes_count ?? 0) > 0;

        const classItems: NavItem[] = [];

        if (canSeeHomeroomClassMenu) {
            classItems.push({
                title: 'Kelas Wali',
                href: teacher.class.index.url(),
                icon: School,
            });
        }

        sections.push(
            { items: [dashboardItem] },
            {
                label: 'Absensi',
                items: [
                    {
                        title: 'QR Absensi',
                        href: teacher.attendance.qr.url(),
                        icon: QrCode,
                    },
                    {
                        title: 'Absensi Manual',
                        href: teacher.attendance.manual.page.url(),
                        icon: PenLine,
                    },
                    {
                        title: 'Rekap Absensi',
                        href: teacher.attendance.recap.url(),
                        icon: CalendarDays,
                    },
                ],
            },
            {
                label: 'Kelas',
                items: classItems,
            },
            {
                label: 'Akademik',
                items: [
                    {
                        title: 'Mata Pelajaran',
                        href: teacher.subjects.index.url(),
                        icon: BookOpenCheck,
                    },
                    // { title: 'Ujian', href: teacher.exams.index.url(), icon: ClipboardList },
                ],
            },
        );
    } else if (role === 'admin') {
        sections.push(
            { items: [dashboardItem] },
            {
                label: 'Kelola',
                items: [
                    {
                        title: 'Pengguna',
                        href: admin.users.index.url(),
                        icon: Users,
                    },
                    {
                        title: 'Kelola Kelas',
                        href: admin.classes.index.url(),
                        icon: School,
                    },
                    {
                        title: 'Kelola Jurusan',
                        href: admin.departments.index.url(),
                        icon: Layers,
                    },
                    {
                        title: 'Kelola Mapel',
                        href: admin.subjects.index.url(),
                        icon: BookOpenCheck,
                    },
                    {
                        title: 'Kelola Jadwal',
                        href: admin.schedules.index.url(),
                        icon: CalendarDays,
                    },
                ],
            },
            {
                label: 'Monitoring',
                items: [
                    {
                        title: 'Laporan',
                        href: admin.reports.overview.url(),
                        icon: BookText,
                    },
                    {
                        title: 'Audit Log',
                        href: admin.auditLogs.index.url(),
                        icon: ScrollText,
                    },
                ],
            },
        );
    } else if (role === 'student') {
        sections.push(
            { items: [dashboardItem] },
            {
                label: 'Kehadiran',
                items: [
                    {
                        title: 'Riwayat',
                        href: student.attendance.index.url(),
                        icon: QrCode,
                    },
                ],
            },
            // {
            //     label: 'Akademik',
            //     items: [
            //         { title: 'Ujian', href: student.exams.index.url(), icon: ClipboardList },
            //     ],
            // },
        );
    } else {
        sections.push({ items: [dashboardItem] });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain sections={sections} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
