/** Runtime configuration sourced from public env vars (with safe defaults). */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api';

/**
 * When true, the API client routes through the in-memory mock adapter instead
 * of hitting the network. Enabled by default so the app runs without a backend.
 */
export const USE_MOCKS = (process.env.NEXT_PUBLIC_USE_MOCKS ?? 'true') !== 'false';

/** Fallback tenant id used to prefill the login form. */
export const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? '1';

export const APP_NAME = 'RENTA';
export const APP_TAGLINE = 'Rental Management';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** localStorage keys for persisted client state. */
export const STORAGE_KEYS = {
  auth: 'renta.auth',
  branch: 'renta.branch',
} as const;
