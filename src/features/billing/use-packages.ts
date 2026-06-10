'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { packagesApi, type ListParams } from './api';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { PackageInput, PackageStatus } from '@/types/billing';

const KEY = ['billing', 'packages'];

export function usePackages(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => packagesApi.list(params),
  });
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    enabled: Boolean(id),
    queryFn: () => packagesApi.get(id),
  });
}

export function usePackageMutations() {
  const qc = useQueryClient();
  const { t } = useT();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (input: PackageInput) => packagesApi.create(input),
    onSuccess: () => {
      toast.success(t('common.toast.created'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PackageInput }) =>
      packagesApi.update(id, input),
    onSuccess: () => {
      toast.success(t('common.toast.updated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => packagesApi.remove(id),
    onSuccess: () => {
      toast.success(t('common.toast.deleted'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.deleteFailed')),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PackageStatus }) =>
      packagesApi.setStatus(id, status),
    onSuccess: () => {
      toast.success(t('common.toast.statusUpdated'));
      invalidate();
    },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });

  return { create, update, remove, setStatus };
}
