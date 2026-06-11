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

/** An image carried on the product payload — the uploaded file plus ordering. */
export interface ProductImageInput {
  url: string;
  storedName?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  sortOrder?: number;
  isPrimary?: boolean;
}

/** The product core fields. */
export interface ProductBodyInput {
  productTypeId: string;
  productGroupId: string;
  unitId: string;
  code: string;
  name: string;
  description?: string;
  rentalPrice: number;
  depositPrice: number;
  images?: ProductImageInput[];
  status?: ActiveStatus;
}

/** A single stock line: a color × size in a branch, with its quantity. */
export interface InventoryItemInput {
  branchId: string;
  colorId: string;
  sizeId: string;
  quantity: number;
}

export interface ProductCreateInput {
  product: ProductBodyInput;
  inventoryItems: InventoryItemInput[];
}

/** Update only carries the product body — inventory is managed via its own endpoints. */
export interface ProductUpdateInput {
  product: ProductBodyInput;
}

/** A file returned by the upload endpoint (`{ data: { files: [...] } }`). */
export interface UploadedFile {
  url: string;
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export const productsApi = {
  /** Upload image files; the backend responds with `{ data: { files: [...] } }`. */
  async uploadImages(files: File[]): Promise<UploadedFile[]> {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    const res = await http.upload<{ files: UploadedFile[] }>('/tenant/uploads', form);
    return res.files ?? [];
  },

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

  /** Add stock to an existing product. Each line spawns `quantity` serial-coded items. */
  addInventoryItems(productId: Id, items: InventoryItemInput[]): Promise<unknown> {
    return http.post(`/tenant/products/${productId}/inventory-items`, items);
  },

  /** Delete one inventory item (a RENTED item returns 409). */
  deleteInventoryItem(itemId: Id): Promise<void> {
    return http.delete(`/tenant/inventory-items/${itemId}`);
  },
};
