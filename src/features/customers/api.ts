import { http } from '@/lib/api/http';
import type { PaginatedResponse } from '@/types/api';
import type { Customer, Id } from '@/types/models';

export interface CustomerListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
}

export interface CustomerCreateInput {
  name: string;
  phone: string;
  address?: string;
  note?: string;
}

export interface CustomerUpdateInput {
  name?: string;
  phone?: string;
  address?: string;
  note?: string;
  branchId?: string;
}

export const customersApi = {
  list(params: CustomerListParams): Promise<PaginatedResponse<Customer>> {
    return http.get<PaginatedResponse<Customer>>('/tenant/customers', { params });
  },

  get(id: Id): Promise<Customer> {
    return http.get<Customer>(`/tenant/customers/${id}`);
  },

  create(input: CustomerCreateInput): Promise<Customer> {
    return http.post<Customer>('/tenant/customers', input);
  },

  update(id: Id, input: CustomerUpdateInput): Promise<Customer> {
    return http.put<Customer>(`/tenant/customers/${id}`, input);
  },

  remove(id: Id): Promise<void> {
    return http.delete(`/tenant/customers/${id}`);
  },
};
