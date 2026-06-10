import { branchHeader, http } from '@/lib/api/http';
import type { PaginatedResponse } from '@/types/api';
import type { Id, RentalOrder } from '@/types/models';
import type { RentalOrderStatus } from '@/types/enums';

export interface RentalOrderListParams {
  customerId?: string;
  status?: RentalOrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

/** Inline new-customer payload (XOR with `customerId`). */
export interface RentalOrderCustomerInput {
  name: string;
  phone: string;
  address?: string;
  note?: string;
}

export interface RentalOrderItemInput {
  inventoryItemId: string;
  price: number;
}

export interface RentalOrderCreateInput {
  orderCode: string;
  customerId?: string;
  customer?: RentalOrderCustomerInput;
  rentDate: string;
  expectedReturnDate: string;
  depositAmount?: number;
  discountAmount?: number;
  note?: string;
  status?: 'DRAFT' | 'RENTING';
  items: RentalOrderItemInput[];
}

export interface RentalOrderUpdateInput {
  note?: string;
  depositAmount?: number;
  discountAmount?: number;
  expectedReturnDate?: string;
}

export const rentalOrdersApi = {
  list(params: RentalOrderListParams): Promise<PaginatedResponse<RentalOrder>> {
    return http.get<PaginatedResponse<RentalOrder>>('/tenant/rental-orders', { params });
  },

  get(id: Id): Promise<RentalOrder> {
    return http.get<RentalOrder>(`/tenant/rental-orders/${id}`);
  },

  create(input: RentalOrderCreateInput, branchId?: string | null): Promise<RentalOrder> {
    return http.post<RentalOrder>('/tenant/rental-orders', input, branchHeader(branchId));
  },

  update(id: Id, input: RentalOrderUpdateInput): Promise<RentalOrder> {
    return http.put<RentalOrder>(`/tenant/rental-orders/${id}`, input);
  },

  confirm(id: Id): Promise<RentalOrder> {
    return http.patch<RentalOrder>(`/tenant/rental-orders/${id}/confirm`);
  },

  cancel(id: Id): Promise<RentalOrder> {
    return http.patch<RentalOrder>(`/tenant/rental-orders/${id}/cancel`);
  },

  remove(id: Id): Promise<void> {
    return http.delete(`/tenant/rental-orders/${id}`);
  },
};
