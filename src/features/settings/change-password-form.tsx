'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChangePassword } from '@/features/auth/use-auth';
import { useT } from '@/i18n/locale-provider';

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const { t } = useT();

  const schema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(6),
          confirmPassword: z.string().min(1),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t('auth.changePassword.mismatch'),
          path: ['confirmPassword'],
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => reset(),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t('auth.changePassword.current')}
        type="password"
        required
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <Input
        label={t('auth.changePassword.new')}
        type="password"
        required
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label={t('auth.changePassword.confirm')}
        type="password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" loading={changePassword.isPending}>
        {t('auth.changePassword.submit')}
      </Button>
    </form>
  );
}
