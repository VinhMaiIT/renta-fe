'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { makeQueryClient } from '@/lib/query/query-client';
import { useAuthStore } from '@/stores/auth-store';

function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  // One QueryClient per browser session (stable across re-renders).
  const [queryClient] = useState(makeQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <AuthHydrator />
          {children}
          <Toaster position="top-right" />
        </NuqsAdapter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
