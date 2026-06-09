import type { ReactNode } from 'react';
import { RouteGuard } from '@/features/auth/route-guard';
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}
