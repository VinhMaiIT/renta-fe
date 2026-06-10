'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, type ListParams } from './api';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';

const KEY = ['billing', 'invoices'];

export function useInvoices(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => invoicesApi.list(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    enabled: Boolean(id),
    queryFn: () => invoicesApi.get(id),
  });
}

export function useInvoiceMutations() {
  const qc = useQueryClient();
  const { t } = useT();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: ['billing', 'subscriptions'] });
  };

  /** Admin marks the invoice PAID (bank transfer); `note` is sent as the payment reference. */
  const markPaid = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      invoicesApi.pay(id, { paymentMethod: 'BANK_TRANSFER', paymentReference: note || undefined }),
    onSuccess: () => {
      toast.success(t('common.toast.statusUpdated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => invoicesApi.cancel(id),
    onSuccess: () => {
      toast.success(t('common.toast.statusUpdated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  return { markPaid, cancel };
}
