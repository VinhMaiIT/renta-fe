import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';
import { routes, MockError, type MockCtx } from './handlers';

/** Build the success envelope. */
function envelope<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

function parseBody(data: unknown): Record<string, unknown> {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return data as Record<string, unknown>;
}

function buildParams(config: InternalAxiosRequestConfig): Record<string, string> {
  const params: Record<string, string> = {};
  const raw = (config.params ?? {}) as Record<string, unknown>;
  for (const [k, v] of Object.entries(raw)) {
    if (v !== undefined && v !== null && v !== '') params[k] = String(v);
  }
  // Also support a query string embedded in the url.
  const qIndex = config.url?.indexOf('?') ?? -1;
  if (qIndex >= 0 && config.url) {
    const search = new URLSearchParams(config.url.slice(qIndex + 1));
    search.forEach((value, key) => {
      if (value !== '') params[key] = value;
    });
  }
  return params;
}

function pathOf(config: InternalAxiosRequestConfig): string {
  let url = config.url ?? '';
  const qIndex = url.indexOf('?');
  if (qIndex >= 0) url = url.slice(0, qIndex);
  // Strip a leading /api if present so route patterns stay clean.
  url = url.replace(/^\/?api/, '');
  if (!url.startsWith('/')) url = `/${url}`;
  return url.replace(/\/$/, '') || '/';
}

const LATENCY_MS = 220;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Axios adapter that resolves requests against the in-memory mock backend,
 * reproducing the real response envelope and error shape so the rest of the
 * app is identical whether mocks are on or off.
 */
export const mockAdapter: AxiosAdapter = async (config) => {
  await delay(LATENCY_MS);

  const method = (config.method ?? 'get').toUpperCase();
  const path = pathOf(config);
  const params = buildParams(config);
  const body = parseBody(config.data);

  const ok = <T>(data: T, status = 200): AxiosResponse =>
    ({
      data: status === 204 ? '' : envelope(data),
      status,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    }) as AxiosResponse;

  for (const route of routes) {
    if (route.method !== method) continue;
    const match = route.pattern.exec(path);
    if (!match) continue;

    const ctx: MockCtx = { params, body, query: params, ids: match.slice(1) };
    try {
      const result = route.handler(ctx);
      const status = route.status ?? (method === 'POST' ? 201 : 200);
      if (route.noContent) return ok(undefined, 204);
      return ok(result as unknown, status);
    } catch (err) {
      const e =
        err instanceof MockError
          ? err
          : new MockError(500, 'INTERNAL_ERROR', (err as Error)?.message ?? 'Mock error');
      const response: AxiosResponse = {
        data: {
          success: false,
          error: { code: e.code, message: e.message },
          timestamp: new Date().toISOString(),
        },
        status: e.status,
        statusText: 'Error',
        headers: {},
        config,
        request: {},
      } as AxiosResponse;
      throw new AxiosError(e.message, String(e.status), config, {}, response);
    }
  }

  const notFound: AxiosResponse = {
    data: {
      success: false,
      error: { code: 'NOT_FOUND', message: `No mock route for ${method} ${path}` },
      timestamp: new Date().toISOString(),
    },
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config,
    request: {},
  } as AxiosResponse;
  throw new AxiosError(`No mock route for ${method} ${path}`, '404', config, {}, notFound);
};
