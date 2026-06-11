'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, type ProductCreateInput, type InventoryItemInput } from './api';
import { makeMasterApi } from '@/features/master-data/api';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { Id } from '@/types/models';
import type { ActiveStatus } from '@/types/enums';
import type { SelectOption } from '@/components/forms/select-field';

const QUERY_KEY = 'products';

export interface UseProductsParams {
  status?: ActiveStatus;
  productTypeId?: string;
  productGroupId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

/** The form emits the create-style payload: `{ product, inventoryItems }`. */
export type ProductFormInput = ProductCreateInput;

export function useProducts(params: UseProductsParams) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: [QUERY_KEY, { ...params, tenantId }],
    enabled: Boolean(tenantId),
    queryFn: () => productsApi.list(params),
  });
}

export function useProduct(id: Id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    enabled: Boolean(id),
    queryFn: () => productsApi.get(id),
  });
}

export function useUploadProductImages() {
  const { t } = useT();
  return useMutation({
    mutationFn: (files: File[]) => productsApi.uploadImages(files),
    onError: (error) => toastError(error, t('products.toast.uploadFailed')),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: (input: ProductFormInput) => productsApi.create(input),
    onSuccess: () => {
      toast.success(t('products.toast.created'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, t('products.toast.createFailed')),
  });
}

/** Save a product edit — only the product body (inventory is managed separately). */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: ProductFormInput }) =>
      productsApi.update(id, { product: input.product }),
    onSuccess: (_data, { id }) => {
      toast.success(t('products.toast.updated'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error) => toastError(error, t('products.toast.updateFailed')),
  });
}

/** Add stock lines to an existing product (immediate, used by the edit screen). */
export function useAddInventoryItems(productId: Id) {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: (items: InventoryItemInput[]) => productsApi.addInventoryItems(productId, items),
    onSuccess: () => {
      toast.success(t('products.toast.inventoryAdded'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, productId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, t('products.toast.inventoryAddFailed')),
  });
}

/** Delete one or more inventory items (immediate). RENTED items return 409. */
export function useDeleteInventoryItems(productId: Id) {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: (itemIds: Id[]) =>
      Promise.all(itemIds.map((itemId) => productsApi.deleteInventoryItem(itemId))),
    onSuccess: () => {
      toast.success(t('products.toast.inventoryDeleted'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, productId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, t('products.toast.inventoryDeleteFailed')),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: (id: Id) => productsApi.remove(id),
    onSuccess: () => {
      toast.success(t('products.toast.deleted'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, t('products.toast.deleteFailed')),
  });
}

export function useSetProductStatus() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: ({ id, status }: { id: Id; status: ActiveStatus }) =>
      productsApi.setStatus(id, status),
    onSuccess: () => {
      toast.success(t('products.toast.statusUpdated'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, t('products.toast.statusFailed')),
  });
}

// --- Lookup helpers ---

const productTypesApi = makeMasterApi('product-types');
const productGroupsApi = makeMasterApi('product-groups');
const unitsApi = makeMasterApi('units');
const sizesApi = makeMasterApi('sizes');

export interface ProductLookups {
  productTypeOptions: SelectOption[];
  productGroupOptions: SelectOption[];
  unitOptions: SelectOption[];
  sizeOptions: SelectOption[];
  productTypeMap: Record<string, string>;
  productGroupMap: Record<string, string>;
  unitMap: Record<string, string>;
  sizeMap: Record<string, string>;
  isLoading: boolean;
}

export function useProductLookups(): ProductLookups {
  const { tenantId } = useTenantContext();
  const params = { status: 'ACTIVE' as const, pageSize: 100 };

  const typesQuery = useQuery({
    queryKey: ['product-types', { tenantId, status: 'ACTIVE', pageSize: 100 }],
    enabled: Boolean(tenantId),
    queryFn: () => productTypesApi.list(params),
  });

  const groupsQuery = useQuery({
    queryKey: ['product-groups', { tenantId, status: 'ACTIVE', pageSize: 100 }],
    enabled: Boolean(tenantId),
    queryFn: () => productGroupsApi.list(params),
  });

  const unitsQuery = useQuery({
    queryKey: ['units', { tenantId, status: 'ACTIVE', pageSize: 100 }],
    enabled: Boolean(tenantId),
    queryFn: () => unitsApi.list(params),
  });

  const sizesQuery = useQuery({
    queryKey: ['sizes', { tenantId, status: 'ACTIVE', pageSize: 100 }],
    enabled: Boolean(tenantId),
    queryFn: () => sizesApi.list(params),
  });

  const toOptions = (items: { id: string; name: string }[]): SelectOption[] =>
    items.map((item) => ({ value: item.id, label: item.name }));

  const toMap = (items: { id: string; name: string }[]): Record<string, string> =>
    Object.fromEntries(items.map((item) => [item.id, item.name]));

  const typeItems = typesQuery.data?.items ?? [];
  const groupItems = groupsQuery.data?.items ?? [];
  const unitItems = unitsQuery.data?.items ?? [];
  const sizeItems = sizesQuery.data?.items ?? [];

  return {
    productTypeOptions: toOptions(typeItems),
    productGroupOptions: toOptions(groupItems),
    unitOptions: toOptions(unitItems),
    sizeOptions: toOptions(sizeItems),
    productTypeMap: toMap(typeItems),
    productGroupMap: toMap(groupItems),
    unitMap: toMap(unitItems),
    sizeMap: toMap(sizeItems),
    isLoading:
      typesQuery.isLoading || groupsQuery.isLoading || unitsQuery.isLoading || sizesQuery.isLoading,
  };
}
