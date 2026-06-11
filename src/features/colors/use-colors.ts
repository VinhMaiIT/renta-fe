'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { colorsApi, type ColorInput, type ColorListParams } from './api';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { ActiveStatus } from '@/types/enums';
import type { Color, Id } from '@/types/models';

const QUERY_KEY = 'colors';

export interface UseColorsParams extends Omit<ColorListParams, 'status'> {
  status?: string;
}

export function useColors(params: UseColorsParams) {
  const { tenantId } = useTenantContext();
  return useQuery({
    queryKey: [QUERY_KEY, { ...params, tenantId }],
    enabled: Boolean(tenantId),
    queryFn: () => colorsApi.list(params),
  });
}

/** ACTIVE colors for pickers (product form). */
export function useColorOptions(): Color[] {
  const { tenantId } = useTenantContext();
  const query = useQuery({
    queryKey: [QUERY_KEY, 'options', tenantId],
    enabled: Boolean(tenantId),
    queryFn: () => colorsApi.list({ status: 'ACTIVE', pageSize: 100, order: 'ASC' }),
  });
  return query.data?.items ?? [];
}

export function useCreateColor() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: (input: ColorInput) => colorsApi.create(input),
    onSuccess: () => {
      toast.success(t('common.toast.created'));
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });
}

export function useUpdateColor() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: ColorInput }) => colorsApi.update(id, input),
    onSuccess: () => {
      toast.success(t('common.toast.updated'));
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });
}

export function useDeleteColor() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: (id: Id) => colorsApi.remove(id),
    onSuccess: () => {
      toast.success(t('common.toast.deleted'));
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (e) => toastError(e, t('common.toast.deleteFailed')),
  });
}

export function useSetColorStatus() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: ({ id, status }: { id: Id; status: ActiveStatus }) =>
      colorsApi.setStatus(id, status),
    onSuccess: () => {
      toast.success(t('common.toast.statusUpdated'));
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });
}
