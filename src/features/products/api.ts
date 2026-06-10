import { http } from '@/lib/api/http';
import type { PaginatedResponse } from '@/types/api';
import type { Product, Id } from '@/types/models';
import type { ActiveStatus } from '@/types/enums';

export interface ProductListParams {
  status?: ActiveStatus;
  productTypeId?: string;
  productGroupId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

export interface ProductImageInput {
  url: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductCreateInput {
  productTypeId: string;
  productGroupId: string;
  unitId: string;
  code: string;
  name: string;
  description?: string;
  rentalPrice: number;
  depositPrice: number;
  sizeIds?: string[];
  images?: ProductImageInput[];
}

export interface ProductUpdateInput {
  productTypeId?: string;
  productGroupId?: string;
  unitId?: string;
  code?: string;
  name?: string;
  description?: string;
  rentalPrice?: number;
  depositPrice?: number;
  sizeIds?: string[];
  images?: ProductImageInput[];
}

export const productsApi = {
  list(params: ProductListParams): Promise<PaginatedResponse<Product>> {
    return http.get<PaginatedResponse<Product>>('/tenant/products', { params });
  },

  get(id: Id): Promise<Product> {
    return http.get<Product>(`/tenant/products/${id}`);
  },

  create(input: ProductCreateInput): Promise<Product> {
    return http.post<Product>('/tenant/products', input);
  },

  update(id: Id, input: ProductUpdateInput): Promise<Product> {
    return http.put<Product>(`/tenant/products/${id}`, input);
  },

  remove(id: Id): Promise<void> {
    return http.delete(`/tenant/products/${id}`);
  },

  setStatus(id: Id, status: ActiveStatus): Promise<Product> {
    return http.patch<Product>(`/tenant/products/${id}/status`, { status });
  },
};
