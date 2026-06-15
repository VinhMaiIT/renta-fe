'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantSelfApi, type UpdateTenantInput } from './api';
import { useAuthStore } from '@/stores/auth-store';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';

const TENANT_SELF_KEY = ['tenant', 'self'] as const;

/** The current tenant's own profile (name, contact, brand color, …). */
export function useTenantProfile() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.session?.accessToken);
  return useQuery({
    queryKey: TENANT_SELF_KEY,
    queryFn: () => tenantSelfApi.get(),
    enabled: hydrated && Boolean(token),
    staleTime: 5 * 60 * 1000,
  });
}

/** Update the current tenant (admin only). Keeps the session brand in sync. */
export function useUpdateTenantProfile() {
  const queryClient = useQueryClient();
  const patchSession = useAuthStore((s) => s.patchSession);
  const { t } = useT();

  return useMutation({
    mutationFn: (input: UpdateTenantInput) => tenantSelfApi.update(input),
    onSuccess: (tenant) => {
      queryClient.setQueryData(TENANT_SELF_KEY, tenant);
      // Mirror the brand color into the session so the live theme stays correct.
      patchSession({ brandColor: tenant.brandColor ?? null });
      toast.success(t('common.toast.updated'));
    },
    onError: (error) => toastError(error, t('common.toast.saveFailed')),
  });
}
