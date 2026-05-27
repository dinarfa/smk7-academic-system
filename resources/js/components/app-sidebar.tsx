import { Link, usePage } from '@inertiajs/react';
import { BookOpenCheck, CalendarDays, LayoutGrid, QrCode, School, Users, BookText } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
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
    const user = auth.user as {
        role?: 'admin' | 'teacher' | 'student';
        homeroom_classes_count?: number;
    } | undefined;
    const role = user?.role;
    const dashboardHref = role === 'teacher'
        ? teacher.dashboard.url()
        : role === 'student'
            ? student.dashboard.url()
            : role === 'admin'
                ? admin.dashboard.url()
                : dashboard();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardHref,
            icon: LayoutGrid,
        },
    ];

    if (role === 'teacher') {
        const canSeeHomeroomClassMenu = (user?.homeroom_classes_count ?? 0) > 0;

        if (canSeeHomeroomClassMenu) {
            mainNavItems.push({
                title: 'Kelas Wali',
                href: teacher.class.index.url(),
                icon: School,
            });
        }

        mainNavItems.push(
            {
                title: 'Rekap Absensi',
                href: teacher.attendance.recap.url(),
                icon: CalendarDays,
            },
            {
                title: 'Data Siswa',
                href: teacher.students.index.url(),
                icon: Users,
            },
            {
                title: 'Subject Management',
                href: teacher.subjects.index.url(),
                icon: BookOpenCheck,
            },
            // {
            //     title: 'Ujian',
            //     href: teacher.exams.index.url(),
            //     icon: ClipboardList,
            // },
        );
    }

    if (role === 'admin') {
        mainNavItems.push(
            {
                title: 'Data Siswa',
                href: teacher.students.index.url(),
                icon: Users,
            },
            {
                title: 'Kelola Kelas',
                href: admin.classes.index.url(),
                icon: School,
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
            {
                title: 'Laporan',
                href: admin.reports.overview.url(),
                icon: BookText,
            }


        );
    }

    if (role === 'student') {
        mainNavItems.push(
            // {
            //     title: 'Ujian',
            //     href: student.exams.index.url(),
            //     icon: ClipboardList,
            // },
            {
                title: 'Kehadiran',
                href: student.attendance.index.url(),
                icon: QrCode,
            },
        );
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
