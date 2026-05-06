import { Link, usePage } from '@inertiajs/react';
import { BookOpenCheck, ClipboardList, LayoutGrid, QrCode, School, Users } from 'lucide-react';
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
import student from '@/routes/student';
import teacher from '@/routes/teacher';
import type { NavItem } from '@/types';


export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role;
    const dashboardHref = role === 'teacher'
        ? teacher.dashboard.url()
        : role === 'student'
            ? student.dashboard.url()
            : dashboard();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardHref,
            icon: LayoutGrid,
        },
    ];

    if (role === 'teacher') {
        mainNavItems.push(
            {
                title: 'Kelas Wali',
                href: teacher.class.index.url(),
                icon: School,
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
            {
                title: 'Ujian',
                href: teacher.exams.index.url(),
                icon: ClipboardList,
            },
        );
    }

    if (role === 'student') {
        mainNavItems.push(
            {
                title: 'Ujian',
                href: student.exams.index.url(),
                icon: ClipboardList,
            },
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
