import { http } from '@/lib/api/http';
import type { PaginatedResponse } from '@/types/api';
import type { InventoryItemConditionStatus } from '@/types/enums';
import type { Id, RentalOrder, ReturnTransaction } from '@/types/models';

export interface ReturnListParams {
  tenantId: string;
  branchId?: string;
  rentalOrderId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

export interface ReturnItemInput {
  rentalOrderItemId: Id;
  inventoryItemId: Id;
  conditionStatus: InventoryItemConditionStatus;
  damageFee?: number;
  note?: string;
}

export interface ReturnCreateInput {
  tenantId: string;
  branchId: string;
  rentalOrderId: string;
  createdBy: string;
  returnDate: string;
  lateFee?: number;
  note?: string;
  items: ReturnItemInput[];
}

/** Rental-order statuses that are eligible for a return. */
export const RETURNABLE_ORDER_STATUSES = ['RENTING', 'PARTIALLY_RETURNED', 'OVERDUE'] as const;

export interface ReturnableOrdersParams {
  tenantId: string;
  branchId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

export const returnsApi = {
  list(params: ReturnListParams): Promise<PaginatedResponse<ReturnTransaction>> {
    return http.get<PaginatedResponse<ReturnTransaction>>('/return-transactions', { params });
  },
  get(id: Id): Promise<ReturnTransaction> {
    return http.get<ReturnTransaction>(`/return-transactions/${id}`);
  },
  create(input: ReturnCreateInput): Promise<ReturnTransaction> {
    return http.post<ReturnTransaction>('/return-transactions', input);
  },
  remove(id: Id): Promise<void> {
    return http.delete(`/return-transactions/${id}`);
  },

  /** Fetch a single rental order (used by the return create flow + detail link). */
  getRentalOrder(id: Id): Promise<RentalOrder> {
    return http.get<RentalOrder>(`/rental-orders/${id}`);
  },

  /**
   * List rental orders that can still receive a return. The backend `status`
   * filter accepts a single value, so we request the returnable set and filter
   * client-side to be safe.
   */
  async listReturnableOrders(
    params: ReturnableOrdersParams,
  ): Promise<PaginatedResponse<RentalOrder>> {
    const res = await http.get<PaginatedResponse<RentalOrder>>('/rental-orders', { params });
    const allowed = new Set<string>(RETURNABLE_ORDER_STATUSES);
    const items = res.items.filter((order) => allowed.has(order.status));
    return { ...res, items };
  },
};
