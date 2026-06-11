import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { normalizeError } from './error';
import type { ApiResponse } from '@/types/api';

/**
 * Thin wrappers around the axios instance that unwrap the response envelope
 * (`response.data.data`) and normalize errors. All feature services build on
 * these so the envelope contract lives in exactly one place.
 */

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const res = await promise;
    return res.data.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Build a request config carrying the working-branch header. The backend reads
 * `X-Branch-Id` for branch-scoped writes (inventory items, rental orders,
 * return transactions); when omitted it falls back to the user's default branch.
 */
export function branchHeader(branchId?: string | null): AxiosRequestConfig | undefined {
  return branchId ? { headers: { 'X-Branch-Id': branchId } } : undefined;
}

export const http = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrap<T>(apiClient.get(url, config));
  },
  post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrap<T>(apiClient.post(url, body, config));
  },
  put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrap<T>(apiClient.put(url, body, config));
  },
  patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrap<T>(apiClient.patch(url, body, config));
  },
  delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrap<T>(apiClient.delete(url, config));
  },
  /**
   * Multipart upload. We must NOT set `Content-Type` ourselves — setting
   * `multipart/form-data` without a boundary produces an unparseable request
   * (the server rejects it, e.g. with 401). Passing `undefined` clears the
   * instance's JSON default so axios/the browser set the boundary-aware header.
   */
  upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    return unwrap<T>(
      apiClient.post(url, formData, {
        ...config,
        headers: { ...config?.headers, 'Content-Type': undefined },
      }),
    );
  },
};
