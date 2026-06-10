import type { ActiveStatus, Id } from './models';

/** Plan/package lifecycle status (reuses the ACTIVE/INACTIVE pattern). */
export type PackageStatus = ActiveStatus;

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIAL'
  | 'PENDING_PAYMENT'
  | 'EXPIRED'
  | 'CANCELLED';
export const SUBSCRIPTION_STATUS_VALUES = [
  'ACTIVE',
  'TRIAL',
  'PENDING_PAYMENT',
  'EXPIRED',
  'CANCELLED',
] as const;

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export const INVOICE_STATUS_VALUES = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const;

export type PaymentCycle = 'MONTHLY' | 'YEARLY';
export const PAYMENT_CYCLE_VALUES = ['MONTHLY', 'YEARLY'] as const;

export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'OTHER';

interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

/** A billing plan offered to tenants. */
export interface Package extends Timestamped {
  id: Id;
  code: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxBranches: number;
  maxUsers: number;
  maxProducts: number;
  maxInventoryItems: number;
  features: string[];
  status: PackageStatus;
}

/**
 * Compact view of a tenant's current subscription, denormalized onto the
 * tenant list/detail responses so the admin grid can show package + dates
 * without an extra round-trip.
 */
export interface TenantPackageSummary {
  subscriptionId: Id;
  packageId: Id;
  packageName: string;
  paymentCycle: PaymentCycle;
  startDate: string;
  endDate: string;
  nextBillingDate: string | null;
  status: SubscriptionStatus;
}

/** A status-change entry in a subscription's history. */
export interface SubscriptionStatusEvent {
  status: SubscriptionStatus;
  at: string;
  note: string | null;
}

/** A tenant's subscription to a package. */
export interface Subscription extends Timestamped {
  id: Id;
  tenantId: Id;
  tenantName: string;
  packageId: Id;
  packageName: string;
  paymentCycle: PaymentCycle;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  status: SubscriptionStatus;
  autoRenew?: boolean;
  statusHistory: SubscriptionStatusEvent[];
}

/** A billing invoice (manual bank-transfer approval flow). */
export interface Invoice extends Timestamped {
  id: Id;
  code: string;
  tenantId: Id;
  tenantName: string;
  subscriptionId: Id;
  packageId: Id;
  packageName: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  bankTransferRef: string | null;
  paymentProofUrl: string | null;
  note: string | null;
  approvalNote: string | null;
}

// --- input payloads ----------------------------------------------------------

export interface PackageInput {
  code: string;
  name: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxBranches: number;
  maxUsers: number;
  maxProducts: number;
  maxInventoryItems: number;
  features: string[];
  status: PackageStatus;
}
