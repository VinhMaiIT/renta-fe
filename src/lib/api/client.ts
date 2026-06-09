import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, USE_MOCKS } from '@/constants/config';
import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  patchStoredSession,
} from '@/lib/auth/tokens';
import type { ApiResponse, AuthTokens } from '@/types';
import { mockAdapter } from '@/mocks/adapter';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Route through the in-memory mock backend unless a real API is configured.
  adapter: USE_MOCKS ? mockAdapter : undefined,
});

// --- Request interceptor: attach the bearer token ----------------------------
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// --- Response interceptor: single-flight refresh on 401 ----------------------
type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function runRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<ApiResponse<AuthTokens>>(
      `${API_BASE_URL}/tenant/auth/refresh`,
      { refreshToken },
      { adapter: USE_MOCKS ? mockAdapter : undefined },
    );
    const tokens = data.data;
    patchStoredSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    return tokens.accessToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      refreshPromise = refreshPromise ?? runRefresh();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return apiClient(original);
      }

      clearStoredSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
