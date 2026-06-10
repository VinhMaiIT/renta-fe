import { http } from '@/lib/api/http';
import type { ActiveStatus } from '@/types/enums';
import type { PaginatedResponse } from '@/types/api';

/** Shared shape of every master-data record (size/unit/type/group). */
export interface MasterRecord {
  id: string;
  tenantId: string;
  name: string;
  order: number;
  status: ActiveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MasterListParams {
  status?: ActiveStatus;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

export interface MasterInput {
  name: string;
  order: number;
}

/** Supported master-data resource paths. */
export type MasterResource = 'sizes' | 'units' | 'product-types' | 'product-groups';

/** Builds a CRUD client bound to a single master-data resource. */
export function makeMasterApi(resource: MasterResource) {
  return {
    list(params: MasterListParams): Promise<PaginatedResponse<MasterRecord>> {
      return http.get<PaginatedResponse<MasterRecord>>(`/tenant/${resource}`, { params });
    },
    get(id: string): Promise<MasterRecord> {
      return http.get<MasterRecord>(`/tenant/${resource}/${id}`);
    },
    create(input: MasterInput): Promise<MasterRecord> {
      return http.post<MasterRecord>(`/tenant/${resource}`, input);
    },
    update(id: string, input: Partial<MasterInput>): Promise<MasterRecord> {
      return http.put<MasterRecord>(`/tenant/${resource}/${id}`, input);
    },
    remove(id: string): Promise<void> {
      return http.delete(`/tenant/${resource}/${id}`);
    },
    setStatus(id: string, status: ActiveStatus): Promise<MasterRecord> {
      return http.patch<MasterRecord>(`/tenant/${resource}/${id}/status`, { status });
    },
  };
}
