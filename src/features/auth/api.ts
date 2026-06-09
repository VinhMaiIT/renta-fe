import { http } from '@/lib/api/http';
import type { AuthTokens, Branch, TenantUserBranch } from '@/types/models';
import type { PaginatedResponse } from '@/types/api';

export interface TenantLoginInput {
  tenantId: string;
  username: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login(input: TenantLoginInput): Promise<AuthTokens> {
    return http.post<AuthTokens>('/tenant/auth/login', input);
  },
  refresh(refreshToken: string): Promise<AuthTokens> {
    return http.post<AuthTokens>('/tenant/auth/refresh', { refreshToken });
  },
  changePassword(input: ChangePasswordInput): Promise<void> {
    return http.post<void>('/tenant/auth/change-password', input);
  },
  /** Branch assignments for a tenant user (used to pick the default branch). */
  getUserBranches(userId: string): Promise<TenantUserBranch[]> {
    return http.get<TenantUserBranch[]>(`/tenant-users/${userId}/branches`);
  },
  listBranches(tenantId: string): Promise<PaginatedResponse<Branch>> {
    return http.get<PaginatedResponse<Branch>>('/branches', {
      params: { tenantId, status: 'ACTIVE', pageSize: 100 },
    });
  },
};
