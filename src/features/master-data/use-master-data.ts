'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { makeMasterApi, type MasterInput, type MasterListParams, type MasterResource } from './api';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { ActiveStatus } from '@/types/enums';

/** Query + mutation hooks scoped to a single master-data resource. */
export function useMasterData(resource: MasterResource) {
  const api = makeMasterApi(resource);
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();
  const { t } = useT();
  const rootKey = [resource];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: rootKey });

  function useList(params: Omit<MasterListParams, 'tenantId'>) {
    return useQuery({
      queryKey: [resource, { ...params, tenantId }],
      enabled: Boolean(tenantId),
      queryFn: () => api.list({ ...params, tenantId }),
    });
  }

  function useCreate() {
    return useMutation({
      mutationFn: (input: MasterInput) => api.create({ ...input, tenantId }),
      onSuccess: () => {
        toast.success(t('common.toast.created'));
        invalidate();
      },
      onError: (error) => toastError(error, t('common.toast.saveFailed')),
    });
  }

  function useUpdate() {
    return useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<MasterInput> }) =>
        api.update(id, input),
      onSuccess: () => {
        toast.success(t('common.toast.updated'));
        invalidate();
      },
      onError: (error) => toastError(error, t('common.toast.saveFailed')),
    });
  }

  function useRemove() {
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => {
        toast.success(t('common.toast.deleted'));
        invalidate();
      },
      onError: (error) => toastError(error, t('common.toast.deleteFailed')),
    });
  }

  function useSetStatus() {
    return useMutation({
      mutationFn: ({ id, status }: { id: string; status: ActiveStatus }) =>
        api.setStatus(id, status),
      onSuccess: () => {
        toast.success(t('common.toast.statusUpdated'));
        invalidate();
      },
      onError: (error) => toastError(error, t('common.toast.saveFailed')),
    });
  }

  return { useList, useCreate, useUpdate, useRemove, useSetStatus };
}
