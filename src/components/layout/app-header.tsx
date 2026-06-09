'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Breadcrumbs } from './breadcrumbs';
import { BranchSwitcher } from './branch-switcher';
import { UserMenu } from './user-menu';

export function AppHeader() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-3 backdrop-blur sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 hidden h-5 sm:block" />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <BranchSwitcher />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
