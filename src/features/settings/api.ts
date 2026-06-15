import { http } from '@/lib/api/http';
import type { Tenant } from '@/types/models';

/** Fields a tenant admin may update on their own organization. */
export interface UpdateTenantInput {
  name?: string;
  phone?: string | null;
  address?: string | null;
  /** Brand color as hex (`#RRGGBB`), or null to reset to system default. */
  brandColor?: string | null;
}

export const tenantSelfApi = {
  /** The current tenant (scoped by the access token). */
  get(): Promise<Tenant> {
    return http.get<Tenant>('/tenant');
  },
  update(input: UpdateTenantInput): Promise<Tenant> {
    return http.patch<Tenant>('/tenant', input);
  },
};
