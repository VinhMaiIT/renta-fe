import { http } from '@/lib/api/http';
import type { PaginatedResponse, SortOrder } from '@/types/api';
import type { Branch, Tenant, Id } from '@/types/models';
import type { ActiveStatus } from '@/types/enums';

export interface TenantListParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  order?: SortOrder;
}

export const tenantsApi = {
  list(params: TenantListParams): Promise<PaginatedResponse<Tenant>> {
    return http.get<PaginatedResponse<Tenant>>('/tenants', { params });
  },

  get(id: Id): Promise<Tenant> {
    return http.get<Tenant>(`/tenants/${id}`);
  },

  setStatus(id: Id, status: ActiveStatus): Promise<Tenant> {
    return http.patch<Tenant>(`/admin/tenants/${id}/status`, { status });
  },

  /** Branches (locations/addresses) belonging to a tenant. */
  listBranches(tenantId: Id): Promise<PaginatedResponse<Branch>> {
    return http.get<PaginatedResponse<Branch>>('/branches', {
      params: { tenantId, pageSize: 100 },
    });
  },
};
