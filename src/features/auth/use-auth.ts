'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi, type ChangePasswordInput, type TenantLoginInput } from './api';
import { decodeJwt } from '@/lib/auth/tokens';
import { useAuthStore } from '@/stores/auth-store';
import { toast, toastError } from '@/lib/toast';

/**
 * Logs in, decodes the token for context, resolves the default branch, and
 * persists the session.
 */
export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (input: TenantLoginInput) => {
      const tokens = await authApi.login(input);
      const payload = decodeJwt(tokens.accessToken);
      const userId = payload?.sub ?? '';
      const tenantId = payload?.tenantId ?? input.tenantId;
      const username = payload?.username ?? input.username;

      // Persist immediately so the auth interceptor can attach the token.
      setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tenantId,
        userId,
        username,
        branchId: null,
      });

      // Resolve a working branch: prefer the user's default assignment.
      let branchId: string | null = null;
      try {
        const assignments = await authApi.getUserBranches(userId);
        branchId =
          assignments.find((a) => a.isDefault)?.branchId ?? assignments[0]?.branchId ?? null;
        if (!branchId) {
          const branches = await authApi.listBranches(tenantId);
          branchId = branches.items.find((b) => b.isMain)?.id ?? branches.items[0]?.id ?? null;
        }
      } catch {
        // Non-fatal: the user can pick a branch from the switcher.
      }

      setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tenantId,
        userId,
        username,
        branchId,
      });
      return { tenantId, userId, branchId };
    },
    onSuccess: () => {
      toast.success('Welcome back', 'You are now signed in.');
      router.replace('/dashboard');
    },
    onError: (error) => toastError(error, 'Login failed'),
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
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authApi.changePassword(input),
    onSuccess: () => toast.success('Password changed'),
    onError: (error) => toastError(error, 'Could not change password'),
  });
}
