import { AxiosError } from 'axios';
import { NormalizedApiError, type ApiErrorResponse } from '@/types/api';

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success: unknown }).success === false &&
    'error' in value
  );
}

/**
 * Convert any thrown value into a {@link NormalizedApiError} exposing a stable
 * `code` (for business-logic branching) and human-readable `message`.
 */
export function normalizeError(error: unknown): NormalizedApiError {
  if (error instanceof NormalizedApiError) return error;

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? null;
    const body = error.response?.data;

    if (isApiErrorResponse(body)) {
      return new NormalizedApiError(body.error.message, body.error.code, status);
    }

    if (error.code === 'ERR_NETWORK') {
      return new NormalizedApiError(
        'Cannot reach the server. Please check your connection.',
        'NETWORK_ERROR',
        null,
      );
    }

    return new NormalizedApiError(
      error.message || 'Unexpected server error',
      'UNKNOWN_ERROR',
      status,
    );
  }

  if (error instanceof Error) {
    return new NormalizedApiError(error.message, 'UNKNOWN_ERROR', null);
  }

  return new NormalizedApiError('Unexpected error', 'UNKNOWN_ERROR', null);
}
