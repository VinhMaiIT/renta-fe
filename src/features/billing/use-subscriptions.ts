'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingLookups, invoicesApi, subscriptionsApi, type ListParams } from './api';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { Subscription } from '@/types/billing';

const KEY = ['billing', 'subscriptions'];

export function useSubscriptions(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => subscriptionsApi.list(params),
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    enabled: Boolean(id),
    queryFn: () => subscriptionsApi.get(id),
  });
}

export function useSubscriptionInvoices(subscriptionId: string) {
  return useQuery({
    queryKey: ['billing', 'invoices', 'bySubscription', subscriptionId],
    enabled: Boolean(subscriptionId),
    queryFn: () => invoicesApi.listForSubscription(subscriptionId),
  });
}

export function useBillingLookups() {
  const tenants = useQuery({ queryKey: ['billing', 'lookup', 'tenants'], queryFn: () => billingLookups.tenants() });
  const packages = useQuery({ queryKey: ['billing', 'lookup', 'packages'], queryFn: () => billingLookups.packages() });
  return { tenants: tenants.data ?? [], packages: packages.data ?? [] };
}

export function useSubscriptionMutations() {
  const qc = useQueryClient();
  const { t } = useT();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: ['billing', 'invoices'] });
  };

  // Renew = re-purchase the same package/cycle → backend issues a new invoice.
  const renew = useMutation({
    mutationFn: (sub: Subscription) =>
      subscriptionsApi.purchase({
        tenantId: sub.tenantId,
        packageId: sub.packageId,
        paymentCycle: sub.paymentCycle,
        autoRenew: true,
      }),
    onSuccess: () => {
      toast.success(t('common.toast.updated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  // Change package = purchase a different package on the same cycle.
  const changePackage = useMutation({
    mutationFn: ({ sub, packageId }: { sub: Subscription; packageId: string }) =>
      subscriptionsApi.purchase({
        tenantId: sub.tenantId,
        packageId,
        paymentCycle: sub.paymentCycle,
      }),
    onSuccess: () => {
      toast.success(t('common.toast.updated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancel(id),
    onSuccess: () => {
      toast.success(t('common.toast.updated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  return { renew, changePackage, cancel };
}
