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
};
