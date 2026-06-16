'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  tenantSelfApi,
  tenantSubscriptionApi,
  type UpdateTenantInput,
  type UpgradePlanInput,
} from './api';
import { useAuthStore } from '@/stores/auth-store';
import { toast, toastError } from '@/lib/toast';
import { NormalizedApiError } from '@/types/api';
import { useT } from '@/i18n/locale-provider';

/** Map upgrade business-error codes/status to a localized message key. */
const UPGRADE_ERROR_KEYS: Record<string, string> = {
  TENANT_ADMIN_REQUIRED: 'settings.subscription.errors.adminRequired',
  SUBSCRIPTION_NOT_AN_UPGRADE: 'settings.subscription.errors.notAnUpgrade',
  PACKAGE_NOT_ACTIVE: 'settings.subscription.errors.packageNotActive',
};

const TENANT_SELF_KEY = ['tenant', 'self'] as const;
const TENANT_PACKAGES_KEY = ['tenant', 'packages'] as const;
const TENANT_PAYMENT_KEY = ['tenant', 'subscription', 'payment'] as const;

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

/** Catalog of plans the tenant can view / upgrade to. */
export function useAvailablePackages() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.session?.accessToken);
  return useQuery({
    queryKey: TENANT_PACKAGES_KEY,
    queryFn: () => tenantSubscriptionApi.packages(),
    enabled: hydrated && Boolean(token),
    staleTime: 5 * 60 * 1000,
  });
}

/** Upgrade the current tenant's plan (admin only). */
export function useUpgradePlan() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: (input: UpgradePlanInput) => tenantSubscriptionApi.upgrade(input),
    onSuccess: () => {
      // The new subscription starts PENDING_PAYMENT; refresh the current plan.
      queryClient.invalidateQueries({ queryKey: TENANT_SELF_KEY });
      toast.success(t('settings.subscription.upgradeRequested'));
    },
    onError: (error) => {
      if (error instanceof NormalizedApiError) {
        const key = UPGRADE_ERROR_KEYS[error.code] ?? (error.status === 404
          ? 'settings.subscription.errors.packageNotFound'
          : null);
        if (key) {
          toast.error(t('settings.subscription.upgradeFailed'), t(key));
          return;
        }
      }
      toastError(error, t('settings.subscription.upgradeFailed'));
    },
  });
}

/** Payment instructions (QR + bank + memo) for the pending invoice. */
export function useSubscriptionPayment(enabled: boolean) {
  return useQuery({
    queryKey: TENANT_PAYMENT_KEY,
    queryFn: () => tenantSubscriptionApi.paymentInfo(),
    enabled,
    staleTime: 60 * 1000,
  });
}

/** Upload a transfer-proof image then attach it to the pending invoice. */
export function useSubmitPaymentProof() {
  const queryClient = useQueryClient();
  const { t } = useT();

  return useMutation({
    mutationFn: async (vars: { invoiceId: string; file: File; paymentReference?: string }) => {
      const paymentProofUrl = await tenantSubscriptionApi.uploadProof(vars.file);
      if (!paymentProofUrl) throw new Error('upload failed');
      return tenantSubscriptionApi.submitProof({
        invoiceId: vars.invoiceId,
        paymentProofUrl,
        paymentReference: vars.paymentReference,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_PAYMENT_KEY });
      queryClient.invalidateQueries({ queryKey: TENANT_SELF_KEY });
      toast.success(t('settings.subscription.payment.proofSubmitted'));
    },
    onError: (error) => toastError(error, t('settings.subscription.payment.proofFailed')),
  });
}

/** Update only the tenant's brand color (admin only). Keeps the session in sync. */
export function useUpdateBrandColor() {
  const queryClient = useQueryClient();
  const patchSession = useAuthStore((s) => s.patchSession);
  const { t } = useT();

  return useMutation({
    // The dedicated endpoint only accepts a hex string; resetting to the
    // system default (null) goes through the general tenant update instead.
    mutationFn: async (brandColor: string | null): Promise<void> => {
      if (brandColor === null) await tenantSelfApi.update({ brandColor: null });
      else await tenantSelfApi.updateBrandColor(brandColor);
    },
    onSuccess: (_data, brandColor) => {
      patchSession({ brandColor });
      queryClient.invalidateQueries({ queryKey: TENANT_SELF_KEY });
      toast.success(t('common.toast.updated'));
    },
    onError: (error) => toastError(error, t('common.toast.saveFailed')),
  });
}
