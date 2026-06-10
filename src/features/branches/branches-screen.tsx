'use client';

import { useSession } from '@/stores/auth-store';
import { BranchesPage } from './branches-page';
import { TenantBranchesPage } from './tenant-branches-page';

/**
 * `/branches` serves two audiences: SaaS admins manage branches across tenants
 * (with a tenant selector), while tenant users manage their own (token-scoped).
 */
export function BranchesScreen() {
  const session = useSession();
  return session?.userType === 'SAAS_ADMIN' ? <BranchesPage /> : <TenantBranchesPage />;
}
