'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchesApi, type BranchCreateInput, type BranchUpdateInput } from './api';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { ActiveStatus } from '@/types/enums';
import type { Id } from '@/types/models';

const QUERY_KEY = 'tenant-branches';

export interface UseTenantBranchesParams {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

/** The current tenant's branches (token-scoped — no tenantId sent). */
export function useTenantBranchList(params: UseTenantBranchesParams) {
  const { tenantId } = useTenantContext();
  return useQuery({
    queryKey: [QUERY_KEY, { ...params, tenantId }],
    enabled: Boolean(tenantId),
    queryFn: () => branchesApi.list(params),
  });
}

export function useTenantBranchMutations() {
  const qc = useQueryClient();
  const { t } = useT();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    // Keep the branch switcher / context list fresh too.
    qc.invalidateQueries({ queryKey: ['branches'] });
  };

  const create = useMutation({
    // Token provides the tenant; no tenantId in the body.
    mutationFn: (input: Omit<BranchCreateInput, 'tenantId'>) => branchesApi.create(input),
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
