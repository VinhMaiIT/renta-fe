'use client';

import type { ReactNode } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { AppFooter } from './app-footer';

/** Authenticated application shell: collapsible sidebar + header + content + footer. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/40 relative flex min-h-svh min-w-0 flex-col">
        <AppHeader />
        <main className="relative w-full min-w-0 flex-1 p-4 sm:p-6">
          {/* Ambient brand glow behind the content for depth. */}
          <div
            aria-hidden
            className="from-primary/10 pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 bg-gradient-to-b to-transparent"
          />
          <div className="relative z-[1] w-full min-w-0 space-y-6">{children}</div>
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
