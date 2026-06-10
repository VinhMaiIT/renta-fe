'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package2 } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { getNavSections } from '@/constants/navigation';
import { APP_NAME, APP_TAGLINE } from '@/constants/config';
import { useT } from '@/i18n/locale-provider';
import { useSession } from '@/stores/auth-store';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useT();
  const session = useSession();
  const sections = getNavSections(session?.userType);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2.5 px-1.5 py-1">
          <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Package2 className="size-5" />
          </span>
          <span className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm leading-tight font-semibold">{APP_NAME}</span>
            <span className="text-muted-foreground text-xs leading-tight">{APP_TAGLINE}</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.labelKey}>
            <SidebarGroupLabel>{t(section.labelKey)}</SidebarGroupLabel>
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
    </Sidebar>
  );
}
