import { http } from '@/lib/api/http';
import type { PaginatedResponse } from '@/types/api';
import type { InventoryItem } from '@/types/models';
import type { InventoryItemStatus, InventoryItemConditionStatus } from '@/types/enums';

export interface InventoryListParams {
  tenantId: string;
  branchId?: string;
  productId?: string;
  sizeId?: string;
  status?: InventoryItemStatus;
  conditionStatus?: InventoryItemConditionStatus;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

export interface InventoryCreateInput {
  tenantId: string;
  branchId: string;
  productId: string;
  sizeId: string;
  serialCode: string;
  barcode?: string;
  status?: InventoryItemStatus;
  conditionStatus?: InventoryItemConditionStatus;
  note?: string;
}

export interface InventoryUpdateInput {
  branchId?: string;
  barcode?: string;
  note?: string;
}

export const inventoryApi = {
  list(params: InventoryListParams): Promise<PaginatedResponse<InventoryItem>> {
    return http.get<PaginatedResponse<InventoryItem>>('/inventory-items', { params });
  },

  get(id: string): Promise<InventoryItem> {
    return http.get<InventoryItem>(`/inventory-items/${id}`);
  },

  create(input: InventoryCreateInput): Promise<InventoryItem> {
    return http.post<InventoryItem>('/inventory-items', input);
  },

  update(id: string, input: InventoryUpdateInput): Promise<InventoryItem> {
    return http.put<InventoryItem>(`/inventory-items/${id}`, input);
  },

  remove(id: string): Promise<void> {
    return http.delete(`/inventory-items/${id}`);
  },

  setStatus(id: string, status: InventoryItemStatus): Promise<InventoryItem> {
    return http.patch<InventoryItem>(`/inventory-items/${id}/status`, { status });
  },

  setCondition(id: string, conditionStatus: InventoryItemConditionStatus): Promise<InventoryItem> {
    return http.patch<InventoryItem>(`/inventory-items/${id}/condition`, { conditionStatus });
  },
};
