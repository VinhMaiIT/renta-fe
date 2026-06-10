'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantsApi } from './api';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { ActiveStatus } from '@/types/enums';
import type { Id } from '@/types/models';

const QUERY_KEY = 'tenants';

export interface UseTenantsParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

export function useTenants(params: UseTenantsParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => tenantsApi.list(params),
  });
}

export function useTenant(id: Id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    enabled: Boolean(id),
    queryFn: () => tenantsApi.get(id),
  });
}

export function useTenantBranches(tenantId: Id) {
  return useQuery({
    queryKey: [QUERY_KEY, tenantId, 'branches'],
    enabled: Boolean(tenantId),
    queryFn: () => tenantsApi.listBranches(tenantId),
  });
}

export function useSetTenantStatus() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: ({ id, status }: { id: Id; status: ActiveStatus }) =>
      tenantsApi.setStatus(id, status),
    onSuccess: () => {
      toast.success(t('common.toast.updated'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, t('common.toast.saveFailed')),
  });
}
