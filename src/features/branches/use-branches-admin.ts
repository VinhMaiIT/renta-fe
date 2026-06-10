'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchesApi, type BranchCreateInput, type BranchUpdateInput } from './api';
import { tenantsApi } from '@/features/tenants/api';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { ActiveStatus } from '@/types/enums';
import type { Id } from '@/types/models';

const QUERY_KEY = 'admin-branches';

export interface UseAdminBranchesParams {
  tenantId?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

/** Fields the branch form supplies; `tenantId` is injected by the page. */
export interface BranchFormInput {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

/** Branches for the selected tenant. Disabled until a tenant is chosen. */
export function useAdminBranches(params: UseAdminBranchesParams) {
  const tenantId = params.tenantId;
  return useQuery({
    queryKey: [QUERY_KEY, params],
    enabled: Boolean(tenantId),
    queryFn: () => branchesApi.list({ ...params, tenantId: tenantId as string }),
  });
}

/** Active tenants for the tenant selector. */
export function useTenantOptions() {
  const query = useQuery({
    queryKey: ['tenants', 'options'],
    queryFn: () => tenantsApi.list({ status: 'ACTIVE', pageSize: 100, order: 'ASC' }),
  });
  return query.data?.items.map((tenant) => ({ value: tenant.id, label: tenant.name })) ?? [];
}

export function useBranchMutations() {
  const qc = useQueryClient();
  const { t } = useT();
  const invalidate = () => qc.invalidateQueries({ queryKey: [QUERY_KEY] });

  const create = useMutation({
    mutationFn: (input: BranchCreateInput) => branchesApi.create(input),
    onSuccess: () => {
      toast.success(t('common.toast.created'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: Id; input: BranchUpdateInput }) =>
      branchesApi.update(id, input),
    onSuccess: () => {
      toast.success(t('common.toast.updated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: Id; status: ActiveStatus }) =>
      branchesApi.setStatus(id, status),
    onSuccess: () => {
      toast.success(t('common.toast.statusUpdated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  const setMain = useMutation({
    mutationFn: (id: Id) => branchesApi.setMain(id),
    onSuccess: () => {
      toast.success(t('common.toast.updated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  return { create, update, setStatus, setMain };
}
