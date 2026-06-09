'use client';

import { useSession } from '@/stores/auth-store';

export interface TenantContext {
  tenantId: string;
  branchId: string | null;
  userId: string;
  username: string;
}

/**
 * The active tenant/branch/user context derived from the session. Feature
 * hooks use this to inject `tenantId`, `branchId`, and `createdBy` into calls.
 */
export function useTenantContext(): TenantContext {
  const session = useSession();
  return {
    tenantId: session?.tenantId ?? '',
    branchId: session?.branchId ?? null,
    userId: session?.userId ?? '',
    username: session?.username ?? '',
  };
}
