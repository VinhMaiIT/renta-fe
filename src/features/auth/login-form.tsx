'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from './use-auth';
import { DEFAULT_TENANT_ID } from '@/constants/config';

const schema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { tenantId: DEFAULT_TENANT_ID, username: '', password: '' },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => login.mutate(values))}
      className="space-y-4"
      noValidate
    >
      <Input
        label="Tenant ID"
        required
        error={errors.tenantId?.message}
        {...register('tenantId')}
      />
      <Input
        label="Username"
        required
        autoComplete="username"
        placeholder="staff01"
        error={errors.username?.message}
        {...register('username')}
      />
      <Input
        label="Password"
        required
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full" loading={login.isPending}>
        Sign in
      </Button>
    </form>
  );
}
