'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi, type CustomerUpdateInput } from './api';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { Id } from '@/types/models';

const QUERY_KEY = 'customers';

export interface UseCustomersParams {
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

export interface CustomerFormInput {
  name: string;
  phone: string;
  address?: string;
  note?: string;
}

export function useCustomers(params: UseCustomersParams) {
  const { tenantId, branchId } = useTenantContext();

  return useQuery({
    queryKey: [QUERY_KEY, { ...params, tenantId }],
    enabled: Boolean(tenantId),
    queryFn: () =>
      customersApi.list({
        tenantId,
        ...(branchId ? { branchId } : {}),
        ...params,
      }),
  });
}

export function useCustomer(id: Id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    enabled: Boolean(id),
    queryFn: () => customersApi.get(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { tenantId, branchId } = useTenantContext();
  const { t } = useT();

  return useMutation({
    mutationFn: (input: CustomerFormInput) =>
      customersApi.create({
        tenantId,
        ...(branchId ? { branchId } : {}),
        ...input,
      }),
    onSuccess: () => {
      toast.success(t('common.toast.created'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, t('common.toast.saveFailed')),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: CustomerUpdateInput }) =>
      customersApi.update(id, input),
    onSuccess: () => {
      toast.success(t('common.toast.updated'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, t('common.toast.saveFailed')),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: (id: Id) => customersApi.remove(id),
    onSuccess: () => {
      toast.success(t('common.toast.deleted'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, t('common.toast.deleteFailed')),
  });
}
