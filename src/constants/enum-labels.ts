import type {
  ActiveStatus,
  InventoryItemConditionStatus,
  InventoryItemStatus,
  RentalOrderItemStatus,
  RentalOrderStatus,
} from '@/types/enums';

/** Tailwind classes for a status pill (works in light + dark). */
export interface StatusMeta {
  label: string;
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
  ACTIVE: { label: 'Active', className: TONE.green },
  INACTIVE: { label: 'Inactive', className: TONE.neutral },
};

export const INVENTORY_STATUS_META: Record<InventoryItemStatus, StatusMeta> = {
  AVAILABLE: { label: 'Available', className: TONE.green },
  RENTED: { label: 'Rented', className: TONE.blue },
  MAINTENANCE: { label: 'Maintenance', className: TONE.amber },
  LOST: { label: 'Lost', className: TONE.red },
  DISABLED: { label: 'Disabled', className: TONE.neutral },
};

export const CONDITION_STATUS_META: Record<InventoryItemConditionStatus, StatusMeta> = {
  NEW: { label: 'New', className: TONE.green },
  GOOD: { label: 'Good', className: TONE.green },
  FAIR: { label: 'Fair', className: TONE.slate },
  NEEDS_CLEANING: { label: 'Needs Cleaning', className: TONE.amber },
  NEEDS_REPAIR: { label: 'Needs Repair', className: TONE.amber },
  DAMAGED: { label: 'Damaged', className: TONE.red },
};

export const RENTAL_ORDER_STATUS_META: Record<RentalOrderStatus, StatusMeta> = {
  DRAFT: { label: 'Draft', className: TONE.neutral },
  RENTING: { label: 'Renting', className: TONE.blue },
  PARTIALLY_RETURNED: { label: 'Partially Returned', className: TONE.amber },
  RETURNED: { label: 'Returned', className: TONE.green },
  OVERDUE: { label: 'Overdue', className: TONE.red },
  CANCELLED: { label: 'Cancelled', className: TONE.slate },
};

export const RENTAL_ORDER_ITEM_STATUS_META: Record<RentalOrderItemStatus, StatusMeta> = {
  RENTED: { label: 'Rented', className: TONE.blue },
  RETURNED: { label: 'Returned', className: TONE.green },
  LOST: { label: 'Lost', className: TONE.red },
  DAMAGED: { label: 'Damaged', className: TONE.red },
  CANCELLED: { label: 'Cancelled', className: TONE.slate },
};

/** Build `{ value, label }` option lists for selects/filters. */
export function toOptions<T extends string>(
  meta: Record<T, StatusMeta>,
): { value: T; label: string }[] {
  return (Object.keys(meta) as T[]).map((value) => ({ value, label: meta[value].label }));
}
