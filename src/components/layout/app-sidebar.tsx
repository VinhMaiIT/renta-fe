'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getNavSections } from '@/constants/navigation';
import { BrandLogo } from './brand-logo';
import { useT } from '@/i18n/locale-provider';
import { useSession } from '@/stores/auth-store';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useT();
  const session = useSession();
  const sections = getNavSections(session?.userType);

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border/60">
      <SidebarHeader className="border-sidebar-border/60 border-b">
        <Link
          href="/dashboard"
          className="flex items-center px-1 py-1.5 group-data-[collapsible=icon]:justify-center"
        >
          <BrandLogo />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-1">
        {sections.map((section) => (
          <SidebarGroup key={section.labelKey}>
            <SidebarGroupLabel className="text-sidebar-foreground/45 px-2 text-[10px] font-semibold tracking-[0.08em] uppercase">
              {t(section.labelKey)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const label = t(item.labelKey);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={label}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
