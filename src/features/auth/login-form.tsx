'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from './use-auth';
import { useT } from '@/i18n/locale-provider';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const login = useLogin();
  const { t } = useT();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => login.mutate(values))}
      className="space-y-4"
      noValidate
    >
      <Input
        label={t('auth.username')}
        required
        size="lg"
        autoComplete="username"
        placeholder="admin"
        error={errors.username?.message}
        {...register('username')}
      />
      <Input
        label={t('auth.password')}
        required
        size="lg"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" size="lg" className="mt-1 w-full" loading={login.isPending}>
        {t('auth.signIn')}
      </Button>
    </form>
  );
}
