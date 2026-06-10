import { http } from '@/lib/api/http';
import type { AuthTokens, AuthUser, Branch, TenantUserBranch } from '@/types/models';
import type { PaginatedResponse } from '@/types/api';

export interface LoginInput {
  username: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login(input: LoginInput): Promise<AuthTokens> {
    return http.post<AuthTokens>('/auth/login', input);
  },
  /** Current authenticated user + tenant context. */
  me(): Promise<AuthUser> {
    return http.get<AuthUser>('/auth/me');
  },
  refresh(refreshToken: string): Promise<AuthTokens> {
    return http.post<AuthTokens>('/auth/refresh', { refreshToken });
  },
  changePassword(input: ChangePasswordInput): Promise<void> {
    return http.post<void>('/auth/change-password', input);
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
