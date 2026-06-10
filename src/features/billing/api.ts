import { http } from '@/lib/api/http';
import type { PaginatedResponse } from '@/types/api';
import type {
  Invoice,
  Package,
  PackageInput,
  PaymentCycle,
  PaymentMethod,
  Subscription,
  SubscriptionStatus,
} from '@/types/billing';
import type { Tenant } from '@/types/models';

/**
 * Billing service — real REST client (NestJS backend). Endpoints follow
 * `docs/FE-BUILD-SPEC.md` §5.4b–5.4c.
 */

export interface ListParams {
  page?: number;
  pageSize?: number;
  order?: 'ASC' | 'DESC';
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// --- packages ----------------------------------------------------------------

export const packagesApi = {
  list(params: ListParams): Promise<PaginatedResponse<Package>> {
    return http.get<PaginatedResponse<Package>>('/packages', { params });
  },
  get(id: string): Promise<Package> {
    return http.get<Package>(`/packages/${id}`);
  },
  create(input: PackageInput): Promise<Package> {
    return http.post<Package>('/packages', input);
  },
  update(id: string, input: PackageInput): Promise<Package> {
    return http.put<Package>(`/packages/${id}`, input);
  },
  remove(id: string): Promise<void> {
    return http.delete(`/packages/${id}`);
  },
  setStatus(id: string, status: Package['status']): Promise<Package> {
    return http.patch<Package>(`/admin/packages/${id}/status`, { status });
  },
};

// --- subscriptions -----------------------------------------------------------

export interface PurchaseInput {
  tenantId: string;
  packageId: string;
  paymentCycle: PaymentCycle;
  autoRenew?: boolean;
}

export const subscriptionsApi = {
  list(params: ListParams): Promise<PaginatedResponse<Subscription>> {
    return http.get<PaginatedResponse<Subscription>>('/subscriptions', { params });
  },
  get(id: string): Promise<Subscription> {
    return http.get<Subscription>(`/subscriptions/${id}`);
  },
  /** Purchase / upgrade / renew — backend creates a PENDING_PAYMENT sub + invoice. */
  purchase(input: PurchaseInput): Promise<{ subscription: Subscription; invoice: Invoice }> {
    return http.post<{ subscription: Subscription; invoice: Invoice }>(
      '/subscriptions/purchase',
      input,
    );
  },
  cancel(id: string): Promise<Subscription> {
    return http.patch<Subscription>(`/subscriptions/${id}/cancel`);
  },
};

// --- invoices ----------------------------------------------------------------

export interface PayInvoiceInput {
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paidAt?: string;
}

export const invoicesApi = {
  list(params: ListParams): Promise<PaginatedResponse<Invoice>> {
    return http.get<PaginatedResponse<Invoice>>('/invoices', { params });
  },
  get(id: string): Promise<Invoice> {
    return http.get<Invoice>(`/invoices/${id}`);
  },
  async listForSubscription(subscriptionId: string): Promise<Invoice[]> {
    const res = await http.get<PaginatedResponse<Invoice>>('/invoices', {
      params: { subscriptionId, pageSize: 100 },
    });
    return res.items;
  },
  /** Admin marks an invoice PAID → backend activates/renews the subscription. */
  pay(id: string, input: PayInvoiceInput = {}): Promise<Invoice> {
    return http.patch<Invoice>(`/admin/invoices/${id}/pay`, input);
  },
  cancel(id: string): Promise<Invoice> {
    return http.patch<Invoice>(`/invoices/${id}/cancel`);
  },
};

// --- lookups (filter option lists) -------------------------------------------

export const billingLookups = {
  async tenants(): Promise<{ id: string; name: string }[]> {
    const res = await http.get<PaginatedResponse<Tenant>>('/tenants', {
      params: { pageSize: 100 },
    });
    return res.items.map((t) => ({ id: t.id, name: t.name }));
  },
  async packages(): Promise<{ id: string; name: string }[]> {
    const res = await http.get<PaginatedResponse<Package>>('/packages', {
      params: { status: 'ACTIVE', pageSize: 100 },
    });
    return res.items.map((p) => ({ id: p.id, name: p.name }));
  },
};

export type { SubscriptionStatus };
