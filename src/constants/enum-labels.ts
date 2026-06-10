import type {
  ActiveStatus,
  InventoryItemConditionStatus,
  InventoryItemStatus,
  RentalOrderItemStatus,
  RentalOrderStatus,
} from '@/types/enums';
import type { InvoiceStatus, PaymentCycle, SubscriptionStatus } from '@/types/billing';

/**
 * Status display metadata. `key` is an i18n path (resolved by `t()` in
 * {@link StatusBadge} / {@link useEnumOptions}); `className` is the pill styling.
 */
export interface StatusMeta {
  key: string;
  className: string;
}

const TONE = {
  neutral: 'bg-muted text-muted-foreground border border-border',
  green: 'bg-success/15 text-success border border-success/30',
  blue: 'bg-primary/15 text-primary border border-primary/30',
  amber: 'bg-warning/20 text-warning border border-warning/40',
  red: 'bg-destructive/15 text-destructive border border-destructive/30',
  slate: 'bg-secondary text-secondary-foreground border border-border',
} as const;

export const ACTIVE_STATUS_META: Record<ActiveStatus, StatusMeta> = {
  ACTIVE: { key: 'enums.activeStatus.ACTIVE', className: TONE.green },
  INACTIVE: { key: 'enums.activeStatus.INACTIVE', className: TONE.neutral },
};

export const INVENTORY_STATUS_META: Record<InventoryItemStatus, StatusMeta> = {
  AVAILABLE: { key: 'enums.inventoryStatus.AVAILABLE', className: TONE.green },
  RENTED: { key: 'enums.inventoryStatus.RENTED', className: TONE.blue },
  MAINTENANCE: { key: 'enums.inventoryStatus.MAINTENANCE', className: TONE.amber },
  LOST: { key: 'enums.inventoryStatus.LOST', className: TONE.red },
  DISABLED: { key: 'enums.inventoryStatus.DISABLED', className: TONE.neutral },
};

export const CONDITION_STATUS_META: Record<InventoryItemConditionStatus, StatusMeta> = {
  NEW: { key: 'enums.condition.NEW', className: TONE.green },
  GOOD: { key: 'enums.condition.GOOD', className: TONE.green },
  FAIR: { key: 'enums.condition.FAIR', className: TONE.slate },
  NEEDS_CLEANING: { key: 'enums.condition.NEEDS_CLEANING', className: TONE.amber },
  NEEDS_REPAIR: { key: 'enums.condition.NEEDS_REPAIR', className: TONE.amber },
  DAMAGED: { key: 'enums.condition.DAMAGED', className: TONE.red },
};

export const RENTAL_ORDER_STATUS_META: Record<RentalOrderStatus, StatusMeta> = {
  DRAFT: { key: 'enums.orderStatus.DRAFT', className: TONE.neutral },
  RENTING: { key: 'enums.orderStatus.RENTING', className: TONE.blue },
  PARTIALLY_RETURNED: { key: 'enums.orderStatus.PARTIALLY_RETURNED', className: TONE.amber },
  RETURNED: { key: 'enums.orderStatus.RETURNED', className: TONE.green },
  OVERDUE: { key: 'enums.orderStatus.OVERDUE', className: TONE.red },
  CANCELLED: { key: 'enums.orderStatus.CANCELLED', className: TONE.slate },
};

export const RENTAL_ORDER_ITEM_STATUS_META: Record<RentalOrderItemStatus, StatusMeta> = {
  RENTED: { key: 'enums.orderItemStatus.RENTED', className: TONE.blue },
  RETURNED: { key: 'enums.orderItemStatus.RETURNED', className: TONE.green },
  LOST: { key: 'enums.orderItemStatus.LOST', className: TONE.red },
  DAMAGED: { key: 'enums.orderItemStatus.DAMAGED', className: TONE.red },
  CANCELLED: { key: 'enums.orderItemStatus.CANCELLED', className: TONE.slate },
};

export const SUBSCRIPTION_STATUS_META: Record<SubscriptionStatus, StatusMeta> = {
  ACTIVE: { key: 'enums.subscriptionStatus.ACTIVE', className: TONE.green },
  TRIAL: { key: 'enums.subscriptionStatus.TRIAL', className: TONE.blue },
  PENDING_PAYMENT: { key: 'enums.subscriptionStatus.PENDING_PAYMENT', className: TONE.amber },
  EXPIRED: { key: 'enums.subscriptionStatus.EXPIRED', className: TONE.red },
  CANCELLED: { key: 'enums.subscriptionStatus.CANCELLED', className: TONE.slate },
};

export const INVOICE_STATUS_META: Record<InvoiceStatus, StatusMeta> = {
  PENDING: { key: 'enums.invoiceStatus.PENDING', className: TONE.amber },
  PAID: { key: 'enums.invoiceStatus.PAID', className: TONE.green },
  OVERDUE: { key: 'enums.invoiceStatus.OVERDUE', className: TONE.red },
  CANCELLED: { key: 'enums.invoiceStatus.CANCELLED', className: TONE.slate },
};

export const PAYMENT_CYCLE_META: Record<PaymentCycle, StatusMeta> = {
  MONTHLY: { key: 'enums.paymentCycle.MONTHLY', className: TONE.slate },
  YEARLY: { key: 'enums.paymentCycle.YEARLY', className: TONE.blue },
};
