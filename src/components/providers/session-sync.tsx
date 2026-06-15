'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Refreshes mutable session fields from `/auth/me` on app startup, so an
 * already-logged-in user picks up tenant changes (e.g. an updated brand colour)
 * without having to log in again.
 */
export function SessionSync() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.session?.accessToken);
  const patchSession = useAuthStore((s) => s.patchSession);

  const { data } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    enabled: hydrated && Boolean(token),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) patchSession({ brandColor: data.brandColor ?? null });
  }, [data, patchSession]);

  return null;
}
