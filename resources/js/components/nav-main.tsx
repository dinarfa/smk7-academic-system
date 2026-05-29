import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export type NavSection = {
    label?: string;
    items: NavItem[];
};

export function NavMain({ sections }: { sections: NavSection[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {sections.map((section, i) => (
                <SidebarGroup key={section.label ?? i} className="px-2 py-0">
                    {section.label && (
                        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                    )}
                    <SidebarMenu>
                        {section.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
