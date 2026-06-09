'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/stores/auth-store';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}

/** Client guard: redirects unauthenticated users to the login page. */
export function RouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !session?.accessToken) {
      router.replace('/login');
    }
  }, [hydrated, session, router]);

  if (!hydrated) return <FullPageLoader />;
  if (!session?.accessToken) return null;
  return <>{children}</>;
}
