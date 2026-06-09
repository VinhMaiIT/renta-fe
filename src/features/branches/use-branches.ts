'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/http';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { useAuthStore } from '@/stores/auth-store';
import type { Branch } from '@/types/models';
import type { PaginatedResponse } from '@/types/api';

/** Active branches for the current tenant. */
export function useBranches() {
  const { tenantId } = useTenantContext();
  return useQuery({
    queryKey: ['branches', tenantId],
    enabled: Boolean(tenantId),
    queryFn: () =>
      http.get<PaginatedResponse<Branch>>('/branches', {
        params: { tenantId, status: 'ACTIVE', pageSize: 100 },
      }),
  });
}

/** Branch context: the list of branches, the active branch, and a setter. */
export function useBranchContext() {
  const { branchId } = useTenantContext();
  const setBranchId = useAuthStore((s) => s.setBranchId);
  const query = useBranches();
  const branches = query.data?.items ?? [];
  const activeBranch = branches.find((b) => b.id === branchId) ?? null;

  return {
    branches,
    activeBranch,
    activeBranchId: branchId,
    isLoading: query.isLoading,
    setBranch: setBranchId,
  };
}
