import type {
  ActiveStatus,
  BranchStatus,
  InventoryItemConditionStatus,
  InventoryItemStatus,
  ProductGroupStatus,
  ProductStatus,
  ProductTypeStatus,
  RentalOrderItemStatus,
  RentalOrderStatus,
  SizeStatus,
  TenantStatus,
  TenantUserStatus,
  UnitStatus,
} from './enums';
import type { TenantPackageSummary } from './billing';

/** All ids are strings (DB bigint exposed as string). */
export type Id = string;

interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface Tenant extends Timestamped {
  id: Id;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: TenantStatus;
  /**
   * Denormalized summary fields for the admin grid/detail. Optional until the
   * BE adds them (see `docs/FE-BUILD-SPEC.md` — Tenant API gaps).
   */
  branchCount?: number;
  subscription?: TenantPackageSummary | null;
}

export interface Branch extends Timestamped {
  id: Id;
  tenantId: Id;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isMain: boolean;
  status: BranchStatus;
}

export interface TenantUser extends Timestamped {
  id: Id;
  tenantId: Id;
  username: string;
  fullName: string;
  phone: string | null;
  status: TenantUserStatus;
}

export interface TenantUserBranch {
  id: Id;
  tenantId: Id;
  userId: Id;
  branchId: Id;
  isDefault: boolean;
}

export interface Customer extends Timestamped {
  id: Id;
  tenantId: Id;
  branchId: Id | null;
  name: string;
  phone: string;
  address: string | null;
  note: string | null;
}

export interface Size extends Timestamped {
  id: Id;
  tenantId: Id;
  name: string;
  order: number;
  status: SizeStatus;
}

export interface Unit extends Timestamped {
  id: Id;
  tenantId: Id;
  name: string;
  order: number;
  status: UnitStatus;
}

export interface ProductType extends Timestamped {
  id: Id;
  tenantId: Id;
  name: string;
  order: number;
  status: ProductTypeStatus;
}

export interface ProductGroup extends Timestamped {
  id: Id;
  tenantId: Id;
  name: string;
  order: number;
  status: ProductGroupStatus;
}

/** A reusable color (pre-created under the Colors screen, picked on products). */
export interface Color extends Timestamped {
  id: Id;
  tenantId: Id;
  name: string;
  hex: string;
  status: ActiveStatus;
}

export interface ProductImage {
  url: string;
  storedName?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  sortOrder?: number;
  isPrimary?: boolean;
}

/** A color a product is offered in (name + optional hex for the swatch). */
export interface ProductColor {
  name: string;
  hex?: string | null;
}

/** Aggregate stock counts for a product (denormalized from inventory items). */
export interface ProductStockSummary {
  total: number;
  available: number;
  rented: number;
}

/** Per-variant (size × color) stock counts — drives the "đang cho thuê" breakdown. */
export interface ProductVariantSummary {
  sizeId?: Id | null;
  sizeName?: string | null;
  color?: string | null;
  total: number;
  available: number;
  rented: number;
}

/** A physical stock unit returned with the product detail (one row per item). */
export interface ProductInventoryItem {
  id: Id;
  serialCode: string;
  status: InventoryItemStatus;
  conditionStatus: InventoryItemConditionStatus;
  branch?: { id: Id; code: string; name: string } | null;
  color?: { id: Id; name: string } | null;
  size?: { id: Id; name: string } | null;
}

export interface Product extends Timestamped {
  id: Id;
  tenantId: Id;
  productTypeId: Id;
  productGroupId: Id;
  unitId: Id;
  code: string;
  name: string;
  description: string | null;
  rentalPrice: number;
  depositPrice: number;
  status: ProductStatus;
  sizeIds: Id[];
  images: ProductImage[];
  /** Physical stock units (product detail endpoint). */
  inventoryItems?: ProductInventoryItem[];
  /**
   * Denormalized fields for the catalog grid — optional until the BE adds them
   * (see `FE-BUILD-SPEC.md` — Product list API gaps).
   */
  colors?: ProductColor[];
  stock?: ProductStockSummary;
  variants?: ProductVariantSummary[];
}

export interface InventoryItem extends Timestamped {
  id: Id;
  tenantId: Id;
  branchId: Id;
  productId: Id;
  sizeId: Id;
  colorId?: Id | null;
  serialCode: string;
  status: InventoryItemStatus;
  conditionStatus: InventoryItemConditionStatus;
  note: string | null;
  /** Nested objects returned by the detail endpoint (preferred over the flat ids). */
  product?: { id: Id; name: string; code?: string } | null;
  branch?: { id: Id; code: string; name: string } | null;
  color?: { id: Id; name: string } | null;
  size?: { id: Id; name: string } | null;
}

export interface RentalOrderItem extends Timestamped {
  id: Id;
  tenantId: Id;
  rentalOrderId: Id;
  inventoryItemId: Id;
  productId: Id;
  price: number;
  status: RentalOrderItemStatus;
}

export interface RentalOrder extends Timestamped {
  id: Id;
  tenantId: Id;
  branchId: Id;
  orderCode: string;
  customerId: Id;
  createdBy: Id;
  rentDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  depositAmount: number;
  discountAmount: number;
  totalAmount: number;
  lateFee: number;
  damageFee: number;
  status: RentalOrderStatus;
  note: string | null;
  items: RentalOrderItem[];
}

export interface ReturnTransactionItem extends Timestamped {
  id: Id;
  tenantId: Id;
  returnTransactionId: Id;
  rentalOrderItemId: Id;
  inventoryItemId: Id;
  conditionStatus: InventoryItemConditionStatus;
  damageFee: number;
  note: string | null;
}

export interface ReturnTransaction extends Timestamped {
  id: Id;
  tenantId: Id;
  branchId: Id;
  rentalOrderId: Id;
  createdBy: Id;
  returnDate: string;
  lateFee: number;
  damageFee: number;
  totalAmount: number;
  note: string | null;
  items: ReturnTransactionItem[];
}

/** Token pair returned by login/refresh. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

/** Current authenticated principal returned by `GET /auth/me`. */
export interface AuthUser {
  id: Id;
  username: string;
  fullName: string;
  phone: string | null;
  status: ActiveStatus;
  userType: string;
  tenantId: Id | null;
  isAdmin: boolean;
  permissions: string[];
}

export type { ActiveStatus };
