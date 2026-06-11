import { branchHeader, http } from '@/lib/api/http';
import type { PaginatedResponse } from '@/types/api';
import type { InventoryItem } from '@/types/models';
import type { InventoryItemStatus, InventoryItemConditionStatus } from '@/types/enums';

export interface InventoryListParams {
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
  productId: string;
  sizeId: string;
  colorId: string;
  /** Optional — the backend generates the serial code. */
  serialCode?: string;
  status?: InventoryItemStatus;
  conditionStatus?: InventoryItemConditionStatus;
  note?: string;
}

/** Form payload: create fields + the branch to create stock in (sent as X-Branch-Id). */
export type InventoryCreatePayload = InventoryCreateInput & { branchId?: string };

export interface InventoryUpdateInput {
  branchId?: string;
  note?: string;
}

export const inventoryApi = {
  list(params: InventoryListParams): Promise<PaginatedResponse<InventoryItem>> {
    return http.get<PaginatedResponse<InventoryItem>>('/tenant/inventory-items', { params });
  },

  get(id: string): Promise<InventoryItem> {
    return http.get<InventoryItem>(`/tenant/inventory-items/${id}`);
  },

  create(input: InventoryCreateInput, branchId?: string | null): Promise<InventoryItem> {
    return http.post<InventoryItem>('/tenant/inventory-items', input, branchHeader(branchId));
  },

  update(id: string, input: InventoryUpdateInput): Promise<InventoryItem> {
    return http.put<InventoryItem>(`/tenant/inventory-items/${id}`, input);
  },

  remove(id: string): Promise<void> {
    return http.delete(`/tenant/inventory-items/${id}`);
  },

  setStatus(id: string, status: InventoryItemStatus): Promise<InventoryItem> {
    return http.patch<InventoryItem>(`/tenant/inventory-items/${id}/status`, { status });
  },

  setCondition(id: string, conditionStatus: InventoryItemConditionStatus): Promise<InventoryItem> {
    return http.patch<InventoryItem>(`/tenant/inventory-items/${id}/condition`, { conditionStatus });
  },
};
