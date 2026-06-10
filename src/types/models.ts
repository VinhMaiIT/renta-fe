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

export interface ProductImage {
  id: Id;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
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
}

export interface InventoryItem extends Timestamped {
  id: Id;
  tenantId: Id;
  branchId: Id;
  productId: Id;
  sizeId: Id;
  serialCode: string;
  barcode: string | null;
  status: InventoryItemStatus;
  conditionStatus: InventoryItemConditionStatus;
  note: string | null;
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
