import { http } from '@/lib/api/http';
import type { Tenant } from '@/types/models';
import type {
  InvoiceStatus,
  Package,
  PaymentCycle,
  PaymentMethod,
  SubscriptionStatus,
} from '@/types/billing';

/** Fields a tenant admin may update on their own organization. */
export interface UpdateTenantInput {
  name?: string;
  phone?: string | null;
  address?: string | null;
  /** Brand color as hex (`#RRGGBB`), or null to reset to system default. */
  brandColor?: string | null;
}

export const tenantSelfApi = {
  /** The current tenant (scoped by the access token). */
  get(): Promise<Tenant> {
    return http.get<Tenant>('/tenant');
  },
  update(input: UpdateTenantInput): Promise<Tenant> {
    return http.patch<Tenant>('/tenant', input);
  },
  /**
   * Update the brand color via its dedicated endpoint. The backend only accepts
   * a hex string (`#RRGGBB`); to reset to the system default use `update({
   * brandColor: null })` instead.
   */
  updateBrandColor(brandColor: string): Promise<void> {
    return http.patch<void>('/tenant/brand-color', { brandColor });
  },
};

/** Body for a tenant-initiated plan upgrade. */
export interface UpgradePlanInput {
  packageId: string;
  paymentCycle: PaymentCycle;
}

/**
 * Subscription returned by `POST /tenant/subscription/upgrade`. Field names
 * follow the backend response, which differs slightly from the SaaS-admin
 * `Subscription` model (no `statusHistory`, adds `amount`).
 */
export interface UpgradeSubscription {
  id: string;
  tenantId: string;
  tenantName: string;
  packageId: string;
  packageName: string;
  paymentCycle: PaymentCycle;
  startDate: string;
  endDate: string;
  nextBillingDate: string | null;
  amount: number;
  autoRenew: boolean;
  status: SubscriptionStatus;
}

/**
 * Invoice returned by the upgrade endpoint. Backend field names differ from the
 * SaaS-admin `Invoice` model: `invoiceCode`/`paidAt`/`paymentReference` and
 * `issueDate`; no `approvalNote` (use `note`).
 */
export interface UpgradeInvoice {
  id: string;
  tenantId: string;
  tenantName: string;
  subscriptionId: string;
  packageId: string;
  packageName: string;
  invoiceCode: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: PaymentMethod | null;
  paymentReference: string | null;
  paymentProofUrl: string | null;
  status: InvoiceStatus;
  note: string | null;
}

export interface UpgradePlanResult {
  subscription: UpgradeSubscription;
  invoice: UpgradeInvoice | null;
}

/** Bank-transfer target shown alongside the QR code. */
export interface PaymentBankInfo {
  name: string;
  accountNumber: string;
  accountHolder: string;
}

/**
 * Payment instructions for the tenant's pending invoice: amount, bank details,
 * a ready-to-render QR image and the transfer memo to copy.
 */
export interface SubscriptionPaymentInfo {
  invoiceId: string;
  invoiceCode: string;
  amount: number;
  status: InvoiceStatus;
  bank: PaymentBankInfo;
  /** Ready-to-render QR image URL (e.g. VietQR) produced by the backend. */
  qrImageUrl: string | null;
  /** Bank-transfer memo the user must enter (usually the invoice code). */
  transferMemo: string;
  /** Set once the user has uploaded a transfer proof (awaiting approval). */
  paymentProofUrl: string | null;
}

export interface SubmitPaymentProofInput {
  invoiceId: string;
  paymentProofUrl: string;
  paymentReference?: string;
}

/**
 * Tenant self-service subscription/plan endpoints. A tenant admin uses these to
 * see the catalog of plans and to upgrade their own subscription.
 *
 * The current subscription itself is read from `tenantSelfApi.get()` →
 * `Tenant.subscription` (a `TenantPackageSummary`); only the catalog + upgrade
 * action need dedicated calls.
 */
export const tenantSubscriptionApi = {
  /**
   * Catalog of active plans. Uses the public packages endpoint documented in
   * `docs/FE-BUILD-SPEC.md` §5.4 (onboarding) — it returns id, code, name,
   * prices, limits and features, which is everything this screen renders.
   */
  packages(): Promise<Package[]> {
    return http.get<Package[]>('/public/packages');
  },
  /**
   * Upgrade the current tenant's plan to `packageId`. Mirrors the SaaS-admin
   * purchase flow: the backend creates a PENDING_PAYMENT subscription + invoice
   * (manual bank-transfer approval) and a SaaS admin activates it once paid.
   *
   * NOTE: backend endpoint is assumed (not yet implemented). When the BE adds a
   * tenant self-service upgrade route, align this path + return shape with it.
   */
  upgrade(input: UpgradePlanInput): Promise<UpgradePlanResult> {
    return http.post<UpgradePlanResult>('/tenant/subscription/upgrade', input);
  },
  /**
   * Payment instructions for the current pending invoice (QR + bank + memo).
   *
   * NOTE: backend endpoint assumed. Mirrors the onboarding PAID `payment`
   * payload (`docs/FE-BUILD-SPEC.md` §5.4). Align the path/shape once BE lands.
   */
  paymentInfo(): Promise<SubscriptionPaymentInfo> {
    return http.get<SubscriptionPaymentInfo>('/tenant/subscription/payment');
  },
  /** Upload a transfer-proof image; returns the stored file URL. */
  async uploadProof(file: File): Promise<string> {
    const form = new FormData();
    form.append('files', file);
    const res = await http.upload<{ files: { url: string }[] }>('/tenant/uploads', form);
    return res.files?.[0]?.url ?? '';
  },
  /**
   * Attach the transfer proof to the pending invoice. The invoice stays PENDING
   * until a SaaS admin confirms the payment.
   *
   * NOTE: backend endpoint assumed (mirrors onboarding `payment-proof`).
   */
  submitProof(input: SubmitPaymentProofInput): Promise<UpgradeInvoice> {
    return http.post<UpgradeInvoice>('/tenant/subscription/payment-proof', input);
  },
};
