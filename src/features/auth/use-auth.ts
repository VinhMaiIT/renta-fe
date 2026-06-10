'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi, type ChangePasswordInput, type LoginInput } from './api';
import { useAuthStore } from '@/stores/auth-store';
import { toast, toastError } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';

/**
 * Logs in, decodes the token for context, resolves the default branch, and
 * persists the session.
 */
export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const { t } = useT();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const tokens = await authApi.login(input);

      // Persist the token first so the interceptor can authorize /auth/me.
      setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tenantId: '',
        userId: '',
        username: input.username,
        fullName: input.username,
        userType: '',
        isAdmin: false,
        branchId: null,
      });

      // Load the authenticated principal (id, tenant, role, …).
      const me = await authApi.me();
      const tenantId = me.tenantId ?? '';

      // Tenant users get a working branch resolved from their assignments;
      // platform admins have no tenant/branch.
      let branchId: string | null = null;
      if (tenantId) {
        try {
          const assignments = await authApi.getUserBranches(me.id);
          branchId =
            assignments.find((a) => a.isDefault)?.branchId ?? assignments[0]?.branchId ?? null;
          if (!branchId) {
            const branches = await authApi.listBranches(tenantId);
            branchId = branches.items.find((b) => b.isMain)?.id ?? branches.items[0]?.id ?? null;
          }
        } catch {
          // Non-fatal: the user can pick a branch from the switcher.
        }
      }

      setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tenantId,
        userId: me.id,
        username: me.username,
        fullName: me.fullName,
        userType: me.userType,
        isAdmin: me.isAdmin,
        branchId,
      });
      return me;
    },
    onSuccess: () => {
      toast.success(t('auth.loginSuccess'), t('auth.loginSuccessDesc'));
      router.replace('/dashboard');
    },
    onError: (error) => toastError(error, t('auth.loginFailed')),
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  return () => {
    logout();
    router.replace('/login');
  };
}

export function useChangePassword() {
  const { t } = useT();
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authApi.changePassword(input),
    onSuccess: () => toast.success(t('auth.changePassword.success')),
    onError: (error) => toastError(error, t('auth.changePassword.title')),
  });
}
