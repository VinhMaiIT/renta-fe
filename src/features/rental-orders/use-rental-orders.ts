'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  rentalOrdersApi,
  type RentalOrderCreateInput,
  type RentalOrderListParams,
  type RentalOrderUpdateInput,
} from './api';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { toast, toastError } from '@/lib/toast';
import type { Id } from '@/types/models';

const QUERY_KEY = 'rental-orders';

export type UseRentalOrdersParams = Omit<RentalOrderListParams, 'tenantId' | 'branchId'>;

/** What the wizard passes to create — context fields are injected by the hook. */
export type CreateRentalOrderInput = Omit<
  RentalOrderCreateInput,
  'tenantId' | 'branchId' | 'createdBy'
>;

export function useRentalOrders(params: UseRentalOrdersParams) {
  const { tenantId, branchId } = useTenantContext();

  return useQuery({
    queryKey: [QUERY_KEY, { ...params, tenantId, branchId }],
    enabled: Boolean(tenantId),
    queryFn: () => rentalOrdersApi.list(params),
  });
}

export function useRentalOrder(id: Id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    enabled: Boolean(id),
    queryFn: () => rentalOrdersApi.get(id),
  });
}

export function useCreateRentalOrder() {
  const queryClient = useQueryClient();
  const { branchId } = useTenantContext();

  return useMutation({
    mutationFn: (input: CreateRentalOrderInput) =>
      rentalOrdersApi.create(input, branchId),
    onSuccess: () => {
      toast.success('Rental order created');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, 'Could not create rental order'),
  });
}

export function useUpdateRentalOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: RentalOrderUpdateInput }) =>
      rentalOrdersApi.update(id, input),
    onSuccess: () => {
      toast.success('Rental order updated');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, 'Could not update rental order'),
  });
}

export function useConfirmRentalOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Id) => rentalOrdersApi.confirm(id),
    onSuccess: () => {
      toast.success('Rental order confirmed');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, 'Could not confirm rental order'),
  });
}

export function useCancelRentalOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Id) => rentalOrdersApi.cancel(id),
    onSuccess: () => {
      toast.success('Rental order cancelled');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, 'Could not cancel rental order'),
  });
}

export function useDeleteRentalOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Id) => rentalOrdersApi.remove(id),
    onSuccess: () => {
      toast.success('Rental order deleted');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => toastError(error, 'Could not delete rental order'),
  });
}
