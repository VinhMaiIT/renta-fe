/**
 * Enum string-literal unions mirroring the backend. Each comes with a readonly
 * `*_VALUES` array for iterating in selects/filters.
 */

export type ActiveStatus = 'ACTIVE' | 'INACTIVE';
export const ACTIVE_STATUS_VALUES = ['ACTIVE', 'INACTIVE'] as const;

export type InventoryItemStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'LOST' | 'DISABLED';
export const INVENTORY_ITEM_STATUS_VALUES = [
  'AVAILABLE',
  'RENTED',
  'MAINTENANCE',
  'LOST',
  'DISABLED',
] as const;

export type InventoryItemConditionStatus =
  | 'NEW'
  | 'GOOD'
  | 'FAIR'
  | 'NEEDS_CLEANING'
  | 'NEEDS_REPAIR'
  | 'DAMAGED';
export const INVENTORY_ITEM_CONDITION_STATUS_VALUES = [
  'NEW',
  'GOOD',
  'FAIR',
  'NEEDS_CLEANING',
  'NEEDS_REPAIR',
  'DAMAGED',
] as const;

export type RentalOrderStatus =
  | 'DRAFT'
  | 'RENTING'
  | 'PARTIALLY_RETURNED'
  | 'RETURNED'
  | 'OVERDUE'
  | 'CANCELLED';
export const RENTAL_ORDER_STATUS_VALUES = [
  'DRAFT',
  'RENTING',
  'PARTIALLY_RETURNED',
  'RETURNED',
  'OVERDUE',
  'CANCELLED',
] as const;

export type RentalOrderItemStatus = 'RENTED' | 'RETURNED' | 'LOST' | 'DAMAGED' | 'CANCELLED';
export const RENTAL_ORDER_ITEM_STATUS_VALUES = [
  'RENTED',
  'RETURNED',
  'LOST',
  'DAMAGED',
  'CANCELLED',
] as const;

export type PrincipalType = 'SAAS_ADMIN' | 'TENANT';

// Aliases so domain models read naturally.
export type TenantStatus = ActiveStatus;
export type BranchStatus = ActiveStatus;
export type TenantUserStatus = ActiveStatus;
export type SizeStatus = ActiveStatus;
export type UnitStatus = ActiveStatus;
export type ProductTypeStatus = ActiveStatus;
export type ProductGroupStatus = ActiveStatus;
export type ProductStatus = ActiveStatus;
