import { STORAGE_KEYS } from '@/constants/config';
import type { PrincipalType } from '@/types/enums';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  tenantId: string;
  userId: string;
  branchId: string | null;
  username: string;
  fullName: string;
  userType: string;
  isAdmin: boolean;
}

export interface JwtPayload {
  sub: string;
  type: PrincipalType;
  username: string;
  tenantId?: string;
  exp?: number;
  iat?: number;
}

const isBrowser = typeof window !== 'undefined';

/** Read the persisted session (tokens + context) from localStorage. */
export function getStoredSession(): StoredSession | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.auth);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: StoredSession): void {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(session));
}

export function patchStoredSession(patch: Partial<StoredSession>): void {
  const current = getStoredSession();
  if (!current) return;
  setStoredSession({ ...current, ...patch });
}

export function clearStoredSession(): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEYS.auth);
}

export function getAccessToken(): string | null {
  return getStoredSession()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getStoredSession()?.refreshToken ?? null;
}

/** Best-effort JWT payload decode (no signature verification — display only). */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json =
      typeof atob === 'function'
        ? atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        : Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
