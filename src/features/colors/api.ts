import { http } from '@/lib/api/http';
import type { PaginatedResponse, SortOrder } from '@/types/api';
import type { Color, Id } from '@/types/models';
import type { ActiveStatus } from '@/types/enums';

export interface ColorListParams {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: SortOrder;
  [key: string]: string | number | undefined;
}

export interface ColorInput {
  name: string;
  hex: string;
}

export const colorsApi = {
  list(params: ColorListParams): Promise<PaginatedResponse<Color>> {
    return http.get<PaginatedResponse<Color>>('/tenant/colors', { params });
  },
  get(id: Id): Promise<Color> {
    return http.get<Color>(`/tenant/colors/${id}`);
  },
  create(input: ColorInput): Promise<Color> {
    return http.post<Color>('/tenant/colors', input);
  },
  update(id: Id, input: ColorInput): Promise<Color> {
    return http.put<Color>(`/tenant/colors/${id}`, input);
  },
  remove(id: Id): Promise<void> {
    return http.delete(`/tenant/colors/${id}`);
  },
  setStatus(id: Id, status: ActiveStatus): Promise<Color> {
    return http.patch<Color>(`/tenant/colors/${id}/status`, { status });
  },
};
