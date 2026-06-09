import type {
  Branch,
  Customer,
  InventoryItem,
  Product,
  ProductGroup,
  ProductType,
  RentalOrder,
  ReturnTransaction,
  Size,
  Tenant,
  TenantUser,
  TenantUserBranch,
  Unit,
} from '@/types/models';

/**
 * In-memory mock database. Seeded once and kept on `globalThis` so it survives
 * Next.js HMR / module re-evaluation during development.
 */
export interface MockDb {
  seq: number;
  tenants: Tenant[];
  branches: Branch[];
  tenantUsers: TenantUser[];
  tenantUserBranches: TenantUserBranch[];
  customers: Customer[];
  sizes: Size[];
  units: Unit[];
  productTypes: ProductType[];
  productGroups: ProductGroup[];
  products: Product[];
  inventoryItems: InventoryItem[];
  rentalOrders: RentalOrder[];
  returnTransactions: ReturnTransaction[];
}

export const nowISO = (): string => new Date().toISOString();

const TENANT_ID = '1';

function seed(): MockDb {
  let id = 0;
  const next = () => String(++id);
  const ts = (daysAgo = 0): string => new Date(Date.now() - daysAgo * 86_400_000).toISOString();

  const tenant: Tenant = {
    id: TENANT_ID,
    code: 'DEMO',
    name: 'Demo Rental Co.',
    phone: '0900000000',
    email: 'hello@demo-rental.test',
    address: '123 Main St',
    status: 'ACTIVE',
    createdAt: ts(120),
    updatedAt: ts(2),
  };

  const branches: Branch[] = [
    {
      id: next(),
      tenantId: TENANT_ID,
      code: 'HCM',
      name: 'Ho Chi Minh Flagship',
      phone: '0911111111',
      email: 'hcm@demo-rental.test',
      address: '12 Nguyen Hue, District 1',
      isMain: true,
      status: 'ACTIVE',
      createdAt: ts(120),
      updatedAt: ts(5),
    },
    {
      id: next(),
      tenantId: TENANT_ID,
      code: 'HN',
      name: 'Hanoi Branch',
      phone: '0922222222',
      email: 'hn@demo-rental.test',
      address: '45 Trang Tien, Hoan Kiem',
      isMain: false,
      status: 'ACTIVE',
      createdAt: ts(90),
      updatedAt: ts(5),
    },
  ];
  const branchId = branches[0].id;

  const tenantUsers: TenantUser[] = [
    {
      id: next(),
      tenantId: TENANT_ID,
      username: 'staff01',
      fullName: 'Alex Nguyen',
      phone: '0933333333',
      status: 'ACTIVE',
      createdAt: ts(100),
      updatedAt: ts(1),
    },
    {
      id: next(),
      tenantId: TENANT_ID,
      username: 'manager',
      fullName: 'Bao Tran',
      phone: '0944444444',
      status: 'ACTIVE',
      createdAt: ts(100),
      updatedAt: ts(1),
    },
  ];
  const userId = tenantUsers[0].id;

  const tenantUserBranches: TenantUserBranch[] = branches.map((b, i) => ({
    id: next(),
    tenantId: TENANT_ID,
    userId,
    branchId: b.id,
    isDefault: i === 0,
  }));

  const mkActive = (name: string, order: number) => ({
    id: next(),
    tenantId: TENANT_ID,
    name,
    order,
    status: 'ACTIVE' as const,
    createdAt: ts(80),
    updatedAt: ts(3),
  });

  const sizes: Size[] = ['S', 'M', 'L', 'XL'].map((n, i) => mkActive(n, i));
  const units: Unit[] = ['Piece', 'Set', 'Pair'].map((n, i) => mkActive(n, i));
  const productTypes: ProductType[] = ['Suit', 'Dress', 'Camera', 'Tent'].map((n, i) =>
    mkActive(n, i),
  );
  const productGroups: ProductGroup[] = ['Formalwear', 'Outdoor', 'Electronics'].map((n, i) =>
    mkActive(n, i),
  );

  const products: Product[] = [];
  const productSeed: Array<[string, string, ProductType, ProductGroup, number, number]> = [
    ['SUIT-CLASSIC', 'Classic Black Suit', productTypes[0], productGroups[0], 350000, 1000000],
    ['DRESS-EVENING', 'Evening Gown', productTypes[1], productGroups[0], 420000, 1500000],
    ['CAM-DSLR', 'DSLR Camera Kit', productTypes[2], productGroups[2], 600000, 5000000],
    ['TENT-4P', '4-Person Camping Tent', productTypes[3], productGroups[1], 250000, 800000],
  ];
  for (const [code, name, type, group, rental, deposit] of productSeed) {
    products.push({
      id: next(),
      tenantId: TENANT_ID,
      productTypeId: type.id,
      productGroupId: group.id,
      unitId: units[0].id,
      code,
      name,
      description: `${name} available for rent.`,
      rentalPrice: rental,
      depositPrice: deposit,
      status: 'ACTIVE',
      sizeIds: sizes.slice(0, 3).map((s) => s.id),
      images: [
        {
          id: next(),
          url: `https://picsum.photos/seed/${code}/600/400`,
          sortOrder: 0,
          isPrimary: true,
        },
      ],
      createdAt: ts(70),
      updatedAt: ts(2),
    });
  }

  const inventoryItems: InventoryItem[] = [];
  let serial = 1000;
  for (const product of products) {
    for (let i = 0; i < 4; i++) {
      const statuses = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'MAINTENANCE'] as const;
      inventoryItems.push({
        id: next(),
        tenantId: TENANT_ID,
        branchId: branches[i % 2].id,
        productId: product.id,
        sizeId: product.sizeIds[i % product.sizeIds.length],
        serialCode: `SN-${serial++}`,
        barcode: `BC-${serial}`,
        status: statuses[i],
        conditionStatus: i === 3 ? 'NEEDS_CLEANING' : 'GOOD',
        note: null,
        createdAt: ts(60),
        updatedAt: ts(1),
      });
    }
  }

  const customers: Customer[] = [
    ['Chi Le', '0987000001', '78 Le Loi'],
    ['Dat Pham', '0987000002', '9 Hai Ba Trung'],
    ['Emma Vo', '0987000003', '210 Cach Mang Thang 8'],
  ].map(([name, phone, address]) => ({
    id: next(),
    tenantId: TENANT_ID,
    branchId,
    name,
    phone,
    address,
    note: null,
    createdAt: ts(40),
    updatedAt: ts(1),
  }));

  return {
    seq: id,
    tenants: [tenant],
    branches,
    tenantUsers,
    tenantUserBranches,
    customers,
    sizes,
    units,
    productTypes,
    productGroups,
    products,
    inventoryItems,
    rentalOrders: [],
    returnTransactions: [],
  };
}

const globalRef = globalThis as typeof globalThis & { __RENTA_MOCK_DB__?: MockDb };

export const db: MockDb = globalRef.__RENTA_MOCK_DB__ ?? (globalRef.__RENTA_MOCK_DB__ = seed());

/** Monotonic id generator shared across all mock writes. */
export function nextId(): string {
  return String(++db.seq);
}

export { TENANT_ID };
