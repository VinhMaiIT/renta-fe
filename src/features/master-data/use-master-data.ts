'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { makeMasterApi, type MasterInput, type MasterListParams, type MasterResource } from './api';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { toast, toastError } from '@/lib/toast';
import type { ActiveStatus } from '@/types/enums';

/** Query + mutation hooks scoped to a single master-data resource. */
export function useMasterData(resource: MasterResource, singular: string) {
  const api = makeMasterApi(resource);
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();
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
        toast.success(`${singular} created`);
        invalidate();
      },
      onError: (error) => toastError(error, `Could not create ${singular.toLowerCase()}`),
    });
  }

  function useUpdate() {
    return useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<MasterInput> }) =>
        api.update(id, input),
      onSuccess: () => {
        toast.success(`${singular} updated`);
        invalidate();
      },
      onError: (error) => toastError(error, `Could not update ${singular.toLowerCase()}`),
    });
  }

  function useRemove() {
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => {
        toast.success(`${singular} deleted`);
        invalidate();
      },
      onError: (error) => toastError(error, `Could not delete ${singular.toLowerCase()}`),
    });
  }

  function useSetStatus() {
    return useMutation({
      mutationFn: ({ id, status }: { id: string; status: ActiveStatus }) =>
        api.setStatus(id, status),
      onSuccess: () => {
        toast.success('Status updated');
        invalidate();
      },
      onError: (error) => toastError(error, 'Could not update status'),
    });
  }

  return { useList, useCreate, useUpdate, useRemove, useSetStatus };
}
