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
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-80 bg-[radial-gradient(80%_100%_at_50%_0%,var(--color-primary)_0%,transparent_70%)] opacity-[0.08]"
          />
          <div className="relative z-[1] mx-auto w-full min-w-0 max-w-[1600px] space-y-6">
            {children}
          </div>
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
