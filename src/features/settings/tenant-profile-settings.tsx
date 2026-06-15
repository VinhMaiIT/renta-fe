'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/stores/auth-store';
import { useT } from '@/i18n/locale-provider';
import { useTenantProfile, useUpdateTenantProfile } from './use-tenant-settings';

type FormValues = { name: string; phone: string; address: string };

export function TenantProfileSettings() {
  const { t } = useT();
  const session = useSession();
  const isAdmin = Boolean(session?.isAdmin);
  const { data: tenant, isLoading } = useTenantProfile();
  const update = useUpdateTenantProfile();

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t('settings.general.nameRequired')).max(255),
        phone: z.string().trim().max(30),
        address: z.string().trim().max(500),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', address: '' },
  });

  useEffect(() => {
    if (tenant) {
      reset({ name: tenant.name ?? '', phone: tenant.phone ?? '', address: tenant.address ?? '' });
    }
  }, [tenant, reset]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    update.mutate(
      { name: values.name, phone: values.phone || null, address: values.address || null },
      {
        onSuccess: (tn) =>
          reset({ name: tn.name ?? '', phone: tn.phone ?? '', address: tn.address ?? '' }),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t('settings.general.code')} value={tenant?.code ?? '—'} disabled readOnly />
        <Input
          label={t('settings.general.name')}
          required
          readOnly={!isAdmin}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label={t('settings.general.phone')}
          readOnly={!isAdmin}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label={t('settings.general.email')}
          value={tenant?.email ?? '—'}
          disabled
          readOnly
        />
      </div>

      <Input
        label={t('settings.general.address')}
        readOnly={!isAdmin}
        error={errors.address?.message}
        {...register('address')}
      />

      {isAdmin ? (
        <div className="flex items-center gap-3">
          <Button type="submit" loading={update.isPending} disabled={!isDirty}>
            {t('common.action.save')}
          </Button>
          {isDirty ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                tenant &&
                reset({
                  name: tenant.name ?? '',
                  phone: tenant.phone ?? '',
                  address: tenant.address ?? '',
                })
              }
            >
              {t('common.action.cancel')}
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Lock className="size-3.5" />
          {t('settings.general.readonlyNote')}
        </p>
      )}
    </form>
  );
}
