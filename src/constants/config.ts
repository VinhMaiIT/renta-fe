/** Runtime configuration sourced from public env vars (with safe defaults). */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api';

export const APP_NAME = 'QLT 365';
export const APP_TAGLINE = 'Quản lý thuê 365';
export const APP_VERSION = '0.1.0';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** localStorage keys for persisted client state. */
export const STORAGE_KEYS = {
  auth: 'renta.auth',
  branch: 'renta.branch',
} as const;
