'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, type InventoryCreatePayload, type InventoryUpdateInput } from './api';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { useBranches } from '@/features/branches/use-branches';
import { toast, toastError } from '@/lib/toast';
import { http } from '@/lib/api/http';
import { useT } from '@/i18n/locale-provider';
import type { InventoryItemStatus, InventoryItemConditionStatus } from '@/types/enums';
import type { PaginatedResponse } from '@/types/api';
import type { Product } from '@/types/models';

const ROOT_KEY = ['inventory-items'];

export type InventoryQueryParams = Record<string, string | number | undefined>;

/** List of inventory items (injected tenantId). */
export function useInventoryItems(params: InventoryQueryParams) {
  const { tenantId } = useTenantContext();
  return useQuery({
    queryKey: [...ROOT_KEY, { ...params, tenantId }],
    enabled: Boolean(tenantId),
    queryFn: () =>
      inventoryApi.list({
        ...params,
        status: params.status as InventoryItemStatus | undefined,
        conditionStatus: params.conditionStatus as InventoryItemConditionStatus | undefined,
      }),
  });
}

/** Single inventory item by id. */
export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: [...ROOT_KEY, id],
    enabled: Boolean(id),
    queryFn: () => inventoryApi.get(id),
  });
}

/** Create mutation — injects tenantId + branchId from context. */
export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    // Branch comes straight from the form dropdown (sent as X-Branch-Id).
    mutationFn: ({ branchId: picked, ...body }: InventoryCreatePayload) =>
      inventoryApi.create(body, picked || undefined),
    onSuccess: () => {
      toast.success(t('inventory.toast.created'));
      queryClient.invalidateQueries({ queryKey: ROOT_KEY });
    },
    onError: (error) => toastError(error, t('inventory.toast.createFailed')),
  });
}

/** Update mutation. */
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: InventoryUpdateInput }) =>
      inventoryApi.update(id, input),
    onSuccess: () => {
      toast.success(t('inventory.toast.updated'));
      queryClient.invalidateQueries({ queryKey: ROOT_KEY });
    },
    onError: (error) => toastError(error, t('inventory.toast.updateFailed')),
  });
}

/** Delete mutation. */
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.remove(id),
    onSuccess: () => {
      toast.success(t('inventory.toast.deleted'));
      queryClient.invalidateQueries({ queryKey: ROOT_KEY });
    },
    onError: (error) => toastError(error, t('inventory.toast.deleteFailed')),
  });
}

/** Set inventory item status. */
export function useSetInventoryStatus() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InventoryItemStatus }) =>
      inventoryApi.setStatus(id, status),
    onSuccess: () => {
      toast.success(t('inventory.toast.statusUpdated'));
      queryClient.invalidateQueries({ queryKey: ROOT_KEY });
    },
    onError: (error) => toastError(error, t('inventory.toast.statusFailed')),
  });
}

/** Set inventory item condition. */
export function useSetInventoryCondition() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: ({
      id,
      conditionStatus,
    }: {
      id: string;
      conditionStatus: InventoryItemConditionStatus;
    }) => inventoryApi.setCondition(id, conditionStatus),
    onSuccess: () => {
      toast.success(t('inventory.toast.conditionUpdated'));
      queryClient.invalidateQueries({ queryKey: ROOT_KEY });
    },
    onError: (error) => toastError(error, t('inventory.toast.conditionFailed')),
  });
}

interface SizeLookup {
  id: string;
  name: string;
}

/**
 * Fetches ACTIVE products + sizes and tenant branches.
 * Returns option arrays + id→name maps.
 */
export function useInventoryLookups() {
  const { tenantId } = useTenantContext();

  const productsQuery = useQuery({
    queryKey: ['products', 'lookup', tenantId],
    enabled: Boolean(tenantId),
    queryFn: () =>
      http.get<PaginatedResponse<Product>>('/tenant/products', {
        params: { status: 'ACTIVE', pageSize: 100 },
      }),
  });

  const sizesQuery = useQuery({
    queryKey: ['sizes', 'lookup', tenantId],
    enabled: Boolean(tenantId),
    queryFn: () =>
      http.get<PaginatedResponse<SizeLookup>>('/tenant/sizes', {
        params: { status: 'ACTIVE', pageSize: 100 },
      }),
  });

  const branchesQuery = useBranches();

  const products = productsQuery.data?.items ?? [];
  const sizes = sizesQuery.data?.items ?? [];
  const branches = branchesQuery.data?.items ?? [];

  const productOptions = products.map((p) => ({ value: p.id, label: p.name }));
  const sizeOptions = sizes.map((s) => ({ value: s.id, label: s.name }));
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  const productMap: Record<string, string> = {};
  for (const p of products) productMap[p.id] = p.name;

  const sizeMap: Record<string, string> = {};
  for (const s of sizes) sizeMap[s.id] = s.name;

  const branchMap: Record<string, string> = {};
  for (const b of branches) branchMap[b.id] = b.name;

  return {
    productOptions,
    sizeOptions,
    branchOptions,
    productMap,
    sizeMap,
    branchMap,
    isLoading: productsQuery.isLoading || sizesQuery.isLoading || branchesQuery.isLoading,
  };
}
