'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  returnsApi,
  type ReturnableOrdersParams,
  type ReturnItemInput,
  type ReturnListParams,
} from './api';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { toast, toastError } from '@/lib/toast';
import type { Id } from '@/types/models';

const QUERY_KEY = 'return-transactions';
const RENTAL_ORDERS_KEY = 'rental-orders';

export type UseReturnTransactionsParams = Omit<ReturnListParams, 'tenantId' | 'branchId'>;

/** Payload supplied by the create form; context fields are injected here. */
export interface CreateReturnFormInput {
  rentalOrderId: string;
  returnDate: string;
  lateFee?: number;
  note?: string;
  items: ReturnItemInput[];
}

export function useReturnTransactions(params: UseReturnTransactionsParams) {
  const { tenantId, branchId } = useTenantContext();

  return useQuery({
    queryKey: [QUERY_KEY, { ...params, tenantId, branchId }],
    enabled: Boolean(tenantId),
    queryFn: () =>
      returnsApi.list({
        tenantId,
        ...(branchId ? { branchId } : {}),
        ...params,
      }),
  });
}

export function useReturnTransaction(id: Id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    enabled: Boolean(id),
    queryFn: () => returnsApi.get(id),
  });
}

/** Fetch a single rental order to drive the return create flow. */
export function useRentalOrderForReturn(orderId: string | undefined) {
  return useQuery({
    queryKey: [RENTAL_ORDERS_KEY, orderId],
    enabled: Boolean(orderId),
    queryFn: () => returnsApi.getRentalOrder(orderId as string),
  });
}

/** List rental orders eligible for a return (RENTING / PARTIALLY_RETURNED / OVERDUE). */
export function useReturnableOrders(params: Omit<ReturnableOrdersParams, 'tenantId' | 'branchId'>) {
  const { tenantId, branchId } = useTenantContext();

  return useQuery({
    queryKey: [RENTAL_ORDERS_KEY, 'returnable', { ...params, tenantId, branchId }],
    enabled: Boolean(tenantId),
    queryFn: () =>
      returnsApi.listReturnableOrders({
        tenantId,
        ...(branchId ? { branchId } : {}),
        ...params,
      }),
  });
}

export function useCreateReturnTransaction() {
  const queryClient = useQueryClient();
  const { tenantId, branchId, userId } = useTenantContext();

  return useMutation({
    mutationFn: (input: CreateReturnFormInput) =>
      returnsApi.create({
        tenantId,
        branchId: branchId ?? '',
        createdBy: userId,
        rentalOrderId: input.rentalOrderId,
        returnDate: input.returnDate,
        ...(input.lateFee !== undefined ? { lateFee: input.lateFee } : {}),
        ...(input.note ? { note: input.note } : {}),
        items: input.items,
      }),
    onSuccess: () => {
      toast.success('Return recorded');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RENTAL_ORDERS_KEY] });
    },
    onError: (error) => toastError(error, 'Could not record return'),
  });
}

export function useDeleteReturnTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Id) => returnsApi.remove(id),
    onSuccess: () => {
      toast.success('Return deleted');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RENTAL_ORDERS_KEY] });
    },
    onError: (error) => toastError(error, 'Could not delete return'),
  });
}
