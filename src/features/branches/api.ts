import { http } from '@/lib/api/http';
import type { PaginatedResponse, SortOrder } from '@/types/api';
import type { Branch, Id } from '@/types/models';
import type { ActiveStatus } from '@/types/enums';

/**
 * SaaS-admin branch management (per tenant). Unlike the tenant-portal branch
 * calls (token-scoped), admin endpoints take an explicit `tenantId` because the
 * admin session has no tenant. See `FE-BUILD-SPEC.md` §5.3.
 */

export interface BranchListParams {
  /** Required for SaaS-admin (cross-tenant); omitted for tenant portal (token-scoped). */
  tenantId?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: SortOrder;
}

export interface BranchCreateInput {
  /** Required for SaaS-admin; omitted for tenant portal (token provides it). */
  tenantId?: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface BranchUpdateInput {
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const branchesApi = {
  list(params: BranchListParams): Promise<PaginatedResponse<Branch>> {
    return http.get<PaginatedResponse<Branch>>('/branches', { params });
  },
  get(id: Id): Promise<Branch> {
    return http.get<Branch>(`/branches/${id}`);
  },
  create(input: BranchCreateInput): Promise<Branch> {
    return http.post<Branch>('/branches', input);
  },
  update(id: Id, input: BranchUpdateInput): Promise<Branch> {
    return http.put<Branch>(`/branches/${id}`, input);
  },
  setStatus(id: Id, status: ActiveStatus): Promise<Branch> {
    return http.patch<Branch>(`/admin/branches/${id}/status`, { status });
  },
  setMain(id: Id): Promise<Branch> {
    return http.patch<Branch>(`/admin/branches/${id}/main`);
  },
};

/**
 * Tenant-portal branch management — token-scoped under `/tenant/branches`
 * (no `tenantId`; the JWT provides it).
 */
export const tenantBranchesApi = {
  list(params: Omit<BranchListParams, 'tenantId'>): Promise<PaginatedResponse<Branch>> {
    return http.get<PaginatedResponse<Branch>>('/tenant/branches', { params });
  },
  get(id: Id): Promise<Branch> {
    return http.get<Branch>(`/tenant/branches/${id}`);
  },
  create(input: Omit<BranchCreateInput, 'tenantId'>): Promise<Branch> {
    return http.post<Branch>('/tenant/branches', input);
  },
  update(id: Id, input: BranchUpdateInput): Promise<Branch> {
    return http.put<Branch>(`/tenant/branches/${id}`, input);
  },
  setStatus(id: Id, status: ActiveStatus): Promise<Branch> {
    return http.patch<Branch>(`/tenant/branches/${id}/status`, { status });
  },
  setMain(id: Id): Promise<Branch> {
    return http.patch<Branch>(`/tenant/branches/${id}/main`);
  },
};
