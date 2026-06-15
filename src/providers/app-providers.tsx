'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { TenantTheme } from '@/components/providers/tenant-theme';
import { SessionSync } from '@/components/providers/session-sync';
import { Toaster } from '@/components/ui/sonner';
import { makeQueryClient } from '@/lib/query/query-client';
import { useAuthStore } from '@/stores/auth-store';
import { LocaleProvider } from '@/i18n/locale-provider';
import type { Locale } from '@/i18n/config';

function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

export function AppProviders({ children, locale }: { children: ReactNode; locale: Locale }) {
  // One QueryClient per browser session (stable across re-renders).
  const [queryClient] = useState(makeQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <LocaleProvider initialLocale={locale}>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>
            <AuthHydrator />
            <SessionSync />
            <TenantTheme />
            {children}
            <Toaster position="top-right" />
          </NuqsAdapter>
        </QueryClientProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
