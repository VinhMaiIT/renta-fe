/**
 * Backend response envelope. Every successful response is wrapped; always
 * unwrap `response.data.data` to get the payload `T`.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/** Machine-readable error payload returned by the backend. */
export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  path?: string;
  timestamp: string;
}

/** Inner shape of every paginated list endpoint (lives inside `data`). */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type SortOrder = 'ASC' | 'DESC';

/** Common query params accepted by list endpoints. */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  order?: SortOrder;
  search?: string;
}

/**
 * Normalized error thrown by the API layer. Feature code can branch on `code`
 * and surface `message` to users.
 */
export class NormalizedApiError extends Error {
  readonly code: string;
  readonly status: number | null;

  constructor(message: string, code: string, status: number | null) {
    super(message);
    this.name = 'NormalizedApiError';
    this.code = code;
    this.status = status;
  }
}
