import { db, nextId, nowISO } from './db';
import type { PaginatedResponse } from '@/types/api';
import type {
  Customer,
  InventoryItem,
  Product,
  ProductGroup,
  ProductType,
  RentalOrder,
  RentalOrderItem,
  ReturnTransaction,
  ReturnTransactionItem,
  Size,
  Unit,
} from '@/types/models';
import type { InventoryItemConditionStatus, RentalOrderStatus } from '@/types/enums';

export class MockError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export interface MockCtx {
  params: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, unknown>;
  ids: string[];
}

export interface MockRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  pattern: RegExp;
  handler: (ctx: MockCtx) => unknown;
  status?: number;
  noContent?: boolean;
}

// --- shared helpers ----------------------------------------------------------

function paginate<T extends { createdAt: string }>(
  items: T[],
  query: Record<string, string>,
): PaginatedResponse<T> {
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.max(1, Number(query.pageSize ?? 20));
  const order = (query.order ?? 'DESC').toUpperCase();
  const sorted = [...items].sort((a, b) =>
    order === 'ASC'
      ? a.createdAt.localeCompare(b.createdAt)
      : b.createdAt.localeCompare(a.createdAt),
  );
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  return {
    items: sorted.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

const norm = (v: unknown): string =>
  String(v ?? '')
    .toLowerCase()
    .trim();

function str(body: Record<string, unknown>, key: string, required = false): string {
  const v = body[key];
  if ((v === undefined || v === null || v === '') && required) {
    throw new MockError(400, 'VALIDATION_ERROR', `Field "${key}" is required`);
  }
  return v === undefined || v === null ? '' : String(v);
}

function num(body: Record<string, unknown>, key: string, fallback = 0): number {
  const v = body[key];
  return v === undefined || v === null || v === '' ? fallback : Number(v);
}

function notFound(label: string): never {
  throw new MockError(404, 'NOT_FOUND', `${label} not found`);
}

// --- master-data CRUD factory (sizes / units / product-types / groups) -------

type MasterEntity = Size | Unit | ProductType | ProductGroup;

function masterRoutes(path: string, get: () => MasterEntity[], label: string): MockRoute[] {
  const base = new RegExp(`^/${path}$`);
  const byId = new RegExp(`^/${path}/([^/]+)$`);
  const status = new RegExp(`^/${path}/([^/]+)/status$`);

  const find = (id: string): MasterEntity => get().find((x) => x.id === id) ?? notFound(label);

  return [
    {
      method: 'GET',
      pattern: base,
      handler: ({ query }) => {
        let items = get();
        if (query.tenantId) items = items.filter((x) => x.tenantId === query.tenantId);
        if (query.status) items = items.filter((x) => x.status === query.status);
        if (query.search) items = items.filter((x) => norm(x.name).includes(norm(query.search)));
        return paginate(items, query);
      },
    },
    {
      method: 'POST',
      pattern: base,
      handler: ({ body }) => {
        const name = str(body, 'name', true);
        const tenantId = str(body, 'tenantId', true);
        if (get().some((x) => x.tenantId === tenantId && norm(x.name) === norm(name))) {
          throw new MockError(409, 'NAME_ALREADY_EXISTS', `"${name}" already exists`);
        }
        const entity = {
          id: nextId(),
          tenantId,
          name,
          order: num(body, 'order', 0),
          status: 'ACTIVE',
          createdAt: nowISO(),
          updatedAt: nowISO(),
        } as MasterEntity;
        get().unshift(entity);
        return entity;
      },
    },
    { method: 'GET', pattern: byId, handler: ({ ids }) => find(ids[0]) },
    {
      method: 'PUT',
      pattern: byId,
      handler: ({ ids, body }) => {
        const entity = find(ids[0]);
        if (body.name !== undefined) entity.name = String(body.name);
        if (body.order !== undefined) entity.order = Number(body.order);
        entity.updatedAt = nowISO();
        return entity;
      },
    },
    {
      method: 'DELETE',
      pattern: byId,
      noContent: true,
      handler: ({ ids }) => {
        const list = get();
        const idx = list.findIndex((x) => x.id === ids[0]);
        if (idx < 0) notFound(label);
        list.splice(idx, 1);
      },
    },
    {
      method: 'PATCH',
      pattern: status,
      handler: ({ ids, body }) => {
        const entity = find(ids[0]);
        entity.status = body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
        entity.updatedAt = nowISO();
        return entity;
      },
    },
  ];
}

// --- auth --------------------------------------------------------------------

function makeJwt(payload: Record<string, unknown>): string {
  const enc = (obj: Record<string, unknown>): string =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const head = enc({ alg: 'HS256', typ: 'JWT' });
  const exp = Math.floor(Date.now() / 1000) + 15 * 60;
  return `${head}.${enc({ ...payload, exp, iat: Math.floor(Date.now() / 1000) })}.mocksig`;
}

function issueTokens(userId: string, username: string, tenantId: string) {
  return {
    accessToken: makeJwt({ sub: userId, type: 'TENANT', username, tenantId }),
    refreshToken: makeJwt({ sub: userId, type: 'TENANT', username, tenantId, refresh: true }),
    tokenType: 'Bearer',
    expiresIn: '15m',
  };
}

const authRoutes: MockRoute[] = [
  {
    method: 'POST',
    pattern: /^\/tenant\/auth\/login$/,
    handler: ({ body }) => {
      const tenantId = str(body, 'tenantId', true);
      const username = str(body, 'username', true);
      str(body, 'password', true);
      const user = db.tenantUsers.find(
        (u) => u.tenantId === tenantId && norm(u.username) === norm(username),
      );
      if (!user) {
        throw new MockError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
      }
      return issueTokens(user.id, user.username, tenantId);
    },
  },
  {
    method: 'POST',
    pattern: /^\/tenant\/auth\/refresh$/,
    handler: ({ body }) => {
      const token = str(body, 'refreshToken', true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1])) as {
          sub: string;
          username: string;
          tenantId: string;
        };
        return issueTokens(payload.sub, payload.username, payload.tenantId);
      } catch {
        throw new MockError(401, 'INVALID_TOKEN', 'Invalid refresh token');
      }
    },
  },
  {
    method: 'POST',
    pattern: /^\/tenant\/auth\/change-password$/,
    noContent: true,
    handler: () => undefined,
  },
  {
    method: 'POST',
    pattern: /^\/tenant\/auth\/forgot-password$/,
    handler: () => ({ message: 'If the account exists, a reset token has been issued.' }),
  },
  {
    method: 'POST',
    pattern: /^\/tenant\/auth\/reset-password$/,
    handler: () => ({ message: 'Password has been reset.' }),
  },
];

// --- branches + tenant-user branch assignments -------------------------------

const branchRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/branches$/,
    handler: ({ query }) => {
      let items = db.branches;
      if (query.tenantId) items = items.filter((b) => b.tenantId === query.tenantId);
      if (query.status) items = items.filter((b) => b.status === query.status);
      if (query.search) items = items.filter((b) => norm(b.name).includes(norm(query.search)));
      return paginate(items, query);
    },
  },
  {
    method: 'GET',
    pattern: /^\/branches\/([^/]+)$/,
    handler: ({ ids }) => db.branches.find((b) => b.id === ids[0]) ?? notFound('Branch'),
  },
  {
    method: 'GET',
    pattern: /^\/tenant-users\/([^/]+)\/branches$/,
    handler: ({ ids }) => db.tenantUserBranches.filter((a) => a.userId === ids[0]),
  },
  {
    method: 'PATCH',
    pattern: /^\/tenant-users\/([^/]+)\/branches\/([^/]+)\/default$/,
    handler: ({ ids }) => {
      const [userId, branchId] = ids;
      db.tenantUserBranches
        .filter((a) => a.userId === userId)
        .forEach((a) => (a.isDefault = a.branchId === branchId));
      return (
        db.tenantUserBranches.find((a) => a.userId === userId && a.branchId === branchId) ??
        notFound('Assignment')
      );
    },
  },
];

// --- customers ---------------------------------------------------------------

const customerRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/customers$/,
    handler: ({ query }) => {
      let items = db.customers;
      if (query.tenantId) items = items.filter((c) => c.tenantId === query.tenantId);
      if (query.branchId) items = items.filter((c) => c.branchId === query.branchId);
      if (query.search) {
        const q = norm(query.search);
        items = items.filter((c) => norm(c.name).includes(q) || norm(c.phone).includes(q));
      }
      return paginate(items, query);
    },
  },
  {
    method: 'POST',
    pattern: /^\/customers$/,
    handler: ({ body }) => {
      const customer: Customer = {
        id: nextId(),
        tenantId: str(body, 'tenantId', true),
        branchId: body.branchId ? String(body.branchId) : null,
        name: str(body, 'name', true),
        phone: str(body, 'phone', true),
        address: body.address ? String(body.address) : null,
        note: body.note ? String(body.note) : null,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      db.customers.unshift(customer);
      return customer;
    },
  },
  {
    method: 'GET',
    pattern: /^\/customers\/([^/]+)$/,
    handler: ({ ids }) => db.customers.find((c) => c.id === ids[0]) ?? notFound('Customer'),
  },
  {
    method: 'PUT',
    pattern: /^\/customers\/([^/]+)$/,
    handler: ({ ids, body }) => {
      const c = db.customers.find((x) => x.id === ids[0]) ?? notFound('Customer');
      for (const key of ['name', 'phone', 'address', 'note', 'branchId'] as const) {
        if (body[key] !== undefined) (c as unknown as Record<string, unknown>)[key] = body[key];
      }
      c.updatedAt = nowISO();
      return c;
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/customers\/([^/]+)$/,
    noContent: true,
    handler: ({ ids }) => {
      const idx = db.customers.findIndex((c) => c.id === ids[0]);
      if (idx < 0) notFound('Customer');
      db.customers.splice(idx, 1);
    },
  },
];

// --- products ----------------------------------------------------------------

const productRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/products$/,
    handler: ({ query }) => {
      let items = db.products;
      if (query.tenantId) items = items.filter((p) => p.tenantId === query.tenantId);
      if (query.status) items = items.filter((p) => p.status === query.status);
      if (query.productTypeId) items = items.filter((p) => p.productTypeId === query.productTypeId);
      if (query.productGroupId)
        items = items.filter((p) => p.productGroupId === query.productGroupId);
      if (query.search) {
        const q = norm(query.search);
        items = items.filter((p) => norm(p.name).includes(q) || norm(p.code).includes(q));
      }
      return paginate(items, query);
    },
  },
  {
    method: 'POST',
    pattern: /^\/products$/,
    handler: ({ body }) => {
      const tenantId = str(body, 'tenantId', true);
      const code = str(body, 'code', true);
      if (db.products.some((p) => p.tenantId === tenantId && norm(p.code) === norm(code))) {
        throw new MockError(409, 'PRODUCT_CODE_ALREADY_EXISTS', `Code "${code}" already exists`);
      }
      const images = Array.isArray(body.images) ? (body.images as Record<string, unknown>[]) : [];
      const product: Product = {
        id: nextId(),
        tenantId,
        productTypeId: str(body, 'productTypeId', true),
        productGroupId: str(body, 'productGroupId', true),
        unitId: str(body, 'unitId', true),
        code,
        name: str(body, 'name', true),
        description: body.description ? String(body.description) : null,
        rentalPrice: num(body, 'rentalPrice'),
        depositPrice: num(body, 'depositPrice'),
        status: 'ACTIVE',
        sizeIds: Array.isArray(body.sizeIds) ? (body.sizeIds as string[]).map(String) : [],
        images: images.map((img, i) => ({
          id: nextId(),
          url: String(img.url),
          sortOrder: Number(img.sortOrder ?? i),
          isPrimary: Boolean(img.isPrimary ?? i === 0),
        })),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      db.products.unshift(product);
      return product;
    },
  },
  {
    method: 'GET',
    pattern: /^\/products\/([^/]+)$/,
    handler: ({ ids }) => db.products.find((p) => p.id === ids[0]) ?? notFound('Product'),
  },
  {
    method: 'PUT',
    pattern: /^\/products\/([^/]+)$/,
    handler: ({ ids, body }) => {
      const p = db.products.find((x) => x.id === ids[0]) ?? notFound('Product');
      for (const key of [
        'productTypeId',
        'productGroupId',
        'unitId',
        'name',
        'description',
        'rentalPrice',
        'depositPrice',
      ] as const) {
        if (body[key] !== undefined) (p as unknown as Record<string, unknown>)[key] = body[key];
      }
      if (Array.isArray(body.sizeIds)) p.sizeIds = (body.sizeIds as string[]).map(String);
      if (Array.isArray(body.images)) {
        p.images = (body.images as Record<string, unknown>[]).map((img, i) => ({
          id: nextId(),
          url: String(img.url),
          sortOrder: Number(img.sortOrder ?? i),
          isPrimary: Boolean(img.isPrimary ?? i === 0),
        }));
      }
      p.updatedAt = nowISO();
      return p;
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/products\/([^/]+)$/,
    noContent: true,
    handler: ({ ids }) => {
      const idx = db.products.findIndex((p) => p.id === ids[0]);
      if (idx < 0) notFound('Product');
      db.products.splice(idx, 1);
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/products\/([^/]+)\/status$/,
    handler: ({ ids, body }) => {
      const p = db.products.find((x) => x.id === ids[0]) ?? notFound('Product');
      p.status = body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
      p.updatedAt = nowISO();
      return p;
    },
  },
];

// --- inventory items ---------------------------------------------------------

const inventoryRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/inventory-items$/,
    handler: ({ query }) => {
      let items = db.inventoryItems;
      for (const key of [
        'tenantId',
        'branchId',
        'productId',
        'sizeId',
        'status',
        'conditionStatus',
      ] as const) {
        if (query[key]) items = items.filter((i) => i[key] === query[key]);
      }
      if (query.search) {
        const q = norm(query.search);
        items = items.filter((i) => norm(i.serialCode).includes(q) || norm(i.barcode).includes(q));
      }
      return paginate(items, query);
    },
  },
  {
    method: 'POST',
    pattern: /^\/inventory-items$/,
    handler: ({ body }) => {
      const tenantId = str(body, 'tenantId', true);
      const serialCode = str(body, 'serialCode', true);
      if (
        db.inventoryItems.some(
          (i) => i.tenantId === tenantId && norm(i.serialCode) === norm(serialCode),
        )
      ) {
        throw new MockError(409, 'SERIAL_CODE_ALREADY_EXISTS', `Serial "${serialCode}" exists`);
      }
      const item: InventoryItem = {
        id: nextId(),
        tenantId,
        branchId: str(body, 'branchId', true),
        productId: str(body, 'productId', true),
        sizeId: str(body, 'sizeId', true),
        serialCode,
        barcode: body.barcode ? String(body.barcode) : null,
        status: (body.status as InventoryItem['status']) ?? 'AVAILABLE',
        conditionStatus: (body.conditionStatus as InventoryItem['conditionStatus']) ?? 'NEW',
        note: body.note ? String(body.note) : null,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      db.inventoryItems.unshift(item);
      return item;
    },
  },
  {
    method: 'GET',
    pattern: /^\/inventory-items\/([^/]+)$/,
    handler: ({ ids }) =>
      db.inventoryItems.find((i) => i.id === ids[0]) ?? notFound('Inventory item'),
  },
  {
    method: 'PUT',
    pattern: /^\/inventory-items\/([^/]+)$/,
    handler: ({ ids, body }) => {
      const item = db.inventoryItems.find((i) => i.id === ids[0]) ?? notFound('Inventory item');
      for (const key of ['branchId', 'barcode', 'note'] as const) {
        if (body[key] !== undefined) (item as unknown as Record<string, unknown>)[key] = body[key];
      }
      item.updatedAt = nowISO();
      return item;
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/inventory-items\/([^/]+)$/,
    noContent: true,
    handler: ({ ids }) => {
      const idx = db.inventoryItems.findIndex((i) => i.id === ids[0]);
      if (idx < 0) notFound('Inventory item');
      db.inventoryItems.splice(idx, 1);
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/inventory-items\/([^/]+)\/status$/,
    handler: ({ ids, body }) => {
      const item = db.inventoryItems.find((i) => i.id === ids[0]) ?? notFound('Inventory item');
      item.status = body.status as InventoryItem['status'];
      item.updatedAt = nowISO();
      return item;
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/inventory-items\/([^/]+)\/condition$/,
    handler: ({ ids, body }) => {
      const item = db.inventoryItems.find((i) => i.id === ids[0]) ?? notFound('Inventory item');
      item.conditionStatus = body.conditionStatus as InventoryItem['conditionStatus'];
      item.updatedAt = nowISO();
      return item;
    },
  },
];

// --- rental orders -----------------------------------------------------------

function resolveCustomerId(body: Record<string, unknown>, tenantId: string): string {
  const hasId = Boolean(body.customerId);
  const inline = body.customer as Record<string, unknown> | undefined;
  if (hasId && inline) {
    throw new MockError(400, 'CUSTOMER_XOR', 'Provide either customerId or customer, not both');
  }
  if (hasId) {
    const c = db.customers.find((x) => x.id === String(body.customerId));
    if (!c) notFound('Customer');
    return String(body.customerId);
  }
  if (inline) {
    const phone = String(inline.phone ?? '');
    const existing = db.customers.find((x) => x.tenantId === tenantId && x.phone === phone);
    if (existing) return existing.id;
    const customer: Customer = {
      id: nextId(),
      tenantId,
      branchId: null,
      name: String(inline.name ?? ''),
      phone,
      address: inline.address ? String(inline.address) : null,
      note: inline.note ? String(inline.note) : null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    db.customers.unshift(customer);
    return customer.id;
  }
  throw new MockError(400, 'CUSTOMER_REQUIRED', 'A customer is required');
}

function recomputeOrderTotal(order: RentalOrder): void {
  const itemsTotal = order.items
    .filter((i) => i.status !== 'CANCELLED')
    .reduce((sum, i) => sum + i.price, 0);
  order.totalAmount = Math.max(
    0,
    itemsTotal - order.discountAmount + order.lateFee + order.damageFee,
  );
}

const rentalOrderRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/rental-orders$/,
    handler: ({ query }) => {
      let items = db.rentalOrders;
      for (const key of ['tenantId', 'branchId', 'customerId', 'status'] as const) {
        if (query[key]) items = items.filter((o) => o[key] === query[key]);
      }
      if (query.search) {
        const q = norm(query.search);
        items = items.filter((o) => norm(o.orderCode).includes(q));
      }
      return paginate(items, query);
    },
  },
  {
    method: 'POST',
    pattern: /^\/rental-orders$/,
    handler: ({ body }) => {
      const tenantId = str(body, 'tenantId', true);
      const branchId = str(body, 'branchId', true);
      const orderCode = str(body, 'orderCode', true);
      if (
        db.rentalOrders.some(
          (o) => o.tenantId === tenantId && norm(o.orderCode) === norm(orderCode),
        )
      ) {
        throw new MockError(409, 'ORDER_CODE_ALREADY_EXISTS', `Order code "${orderCode}" exists`);
      }
      const customerId = resolveCustomerId(body, tenantId);
      const status = ((body.status as RentalOrderStatus) ?? 'RENTING') as RentalOrderStatus;
      const rawItems = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
      if (rawItems.length === 0) {
        throw new MockError(400, 'ITEMS_REQUIRED', 'At least one item is required');
      }
      const orderId = nextId();
      const items: RentalOrderItem[] = rawItems.map((raw) => {
        const inventoryItemId = String(raw.inventoryItemId);
        const inv = db.inventoryItems.find((i) => i.id === inventoryItemId);
        if (!inv) notFound('Inventory item');
        if (status === 'RENTING' && inv.status !== 'AVAILABLE') {
          throw new MockError(
            409,
            'INVENTORY_NOT_AVAILABLE',
            `Item ${inv.serialCode} is not available`,
          );
        }
        return {
          id: nextId(),
          tenantId,
          rentalOrderId: orderId,
          inventoryItemId,
          productId: inv.productId,
          price: Number(raw.price ?? 0),
          status: 'RENTED',
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
      });
      if (status === 'RENTING') {
        items.forEach((it) => {
          const inv = db.inventoryItems.find((i) => i.id === it.inventoryItemId);
          if (inv) inv.status = 'RENTED';
        });
      }
      const order: RentalOrder = {
        id: orderId,
        tenantId,
        branchId,
        orderCode,
        customerId,
        createdBy: str(body, 'createdBy', true),
        rentDate: str(body, 'rentDate', true),
        expectedReturnDate: str(body, 'expectedReturnDate', true),
        actualReturnDate: null,
        depositAmount: num(body, 'depositAmount'),
        discountAmount: num(body, 'discountAmount'),
        totalAmount: 0,
        lateFee: 0,
        damageFee: 0,
        status,
        note: body.note ? String(body.note) : null,
        items,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      recomputeOrderTotal(order);
      db.rentalOrders.unshift(order);
      return order;
    },
  },
  {
    method: 'GET',
    pattern: /^\/rental-orders\/([^/]+)$/,
    handler: ({ ids }) => db.rentalOrders.find((o) => o.id === ids[0]) ?? notFound('Rental order'),
  },
  {
    method: 'PUT',
    pattern: /^\/rental-orders\/([^/]+)$/,
    handler: ({ ids, body }) => {
      const order = db.rentalOrders.find((o) => o.id === ids[0]) ?? notFound('Rental order');
      if (order.status !== 'DRAFT') {
        throw new MockError(409, 'ORDER_NOT_EDITABLE', 'Only DRAFT orders can be edited');
      }
      if (body.note !== undefined) order.note = body.note ? String(body.note) : null;
      if (body.depositAmount !== undefined) order.depositAmount = Number(body.depositAmount);
      if (body.discountAmount !== undefined) order.discountAmount = Number(body.discountAmount);
      if (body.expectedReturnDate !== undefined)
        order.expectedReturnDate = String(body.expectedReturnDate);
      recomputeOrderTotal(order);
      order.updatedAt = nowISO();
      return order;
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/rental-orders\/([^/]+)\/confirm$/,
    handler: ({ ids }) => {
      const order = db.rentalOrders.find((o) => o.id === ids[0]) ?? notFound('Rental order');
      if (order.status !== 'DRAFT') {
        throw new MockError(409, 'INVALID_STATUS_TRANSITION', 'Only DRAFT orders can be confirmed');
      }
      order.items.forEach((it) => {
        const inv = db.inventoryItems.find((i) => i.id === it.inventoryItemId);
        if (inv && inv.status !== 'AVAILABLE') {
          throw new MockError(
            409,
            'INVENTORY_NOT_AVAILABLE',
            `Item ${inv.serialCode} is not available`,
          );
        }
      });
      order.items.forEach((it) => {
        const inv = db.inventoryItems.find((i) => i.id === it.inventoryItemId);
        if (inv) inv.status = 'RENTED';
      });
      order.status = 'RENTING';
      order.updatedAt = nowISO();
      return order;
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/rental-orders\/([^/]+)\/cancel$/,
    handler: ({ ids }) => {
      const order = db.rentalOrders.find((o) => o.id === ids[0]) ?? notFound('Rental order');
      if (['RETURNED', 'CANCELLED'].includes(order.status)) {
        throw new MockError(
          409,
          'INVALID_STATUS_TRANSITION',
          `Cannot cancel a ${order.status} order`,
        );
      }
      order.items.forEach((it) => {
        if (it.status === 'RENTED') {
          it.status = 'CANCELLED';
          const inv = db.inventoryItems.find((i) => i.id === it.inventoryItemId);
          if (inv && inv.status === 'RENTED') inv.status = 'AVAILABLE';
        }
      });
      order.status = 'CANCELLED';
      order.updatedAt = nowISO();
      return order;
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/rental-orders\/([^/]+)$/,
    noContent: true,
    handler: ({ ids }) => {
      const order = db.rentalOrders.find((o) => o.id === ids[0]) ?? notFound('Rental order');
      if (!['DRAFT', 'CANCELLED'].includes(order.status)) {
        throw new MockError(
          409,
          'ORDER_NOT_DELETABLE',
          'Only DRAFT or CANCELLED orders can be deleted',
        );
      }
      db.rentalOrders = db.rentalOrders.filter((o) => o.id !== ids[0]);
    },
  },
];

// --- return transactions -----------------------------------------------------

const returnTransactionRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/return-transactions$/,
    handler: ({ query }) => {
      let items = db.returnTransactions;
      for (const key of ['tenantId', 'branchId', 'rentalOrderId'] as const) {
        if (query[key]) items = items.filter((t) => t[key] === query[key]);
      }
      return paginate(items, query);
    },
  },
  {
    method: 'POST',
    pattern: /^\/return-transactions$/,
    handler: ({ body }) => {
      const tenantId = str(body, 'tenantId', true);
      const rentalOrderId = str(body, 'rentalOrderId', true);
      const order = db.rentalOrders.find((o) => o.id === rentalOrderId) ?? notFound('Rental order');
      const rawItems = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
      if (rawItems.length === 0) {
        throw new MockError(400, 'ITEMS_REQUIRED', 'At least one item is required');
      }
      const txnId = nextId();
      let damageTotal = 0;
      const items: ReturnTransactionItem[] = rawItems.map((raw) => {
        const rentalOrderItemId = String(raw.rentalOrderItemId);
        const orderItem = order.items.find((i) => i.id === rentalOrderItemId);
        if (!orderItem) notFound('Rental order item');
        if (orderItem.status === 'RETURNED') {
          throw new MockError(409, 'ITEM_ALREADY_RETURNED', 'Item already returned');
        }
        const conditionStatus = raw.conditionStatus as InventoryItemConditionStatus;
        const damageFee = Number(raw.damageFee ?? 0);
        damageTotal += damageFee;
        orderItem.status = 'RETURNED';
        orderItem.updatedAt = nowISO();
        const inv = db.inventoryItems.find((i) => i.id === orderItem.inventoryItemId);
        if (inv) {
          inv.status = conditionStatus === 'DAMAGED' ? 'MAINTENANCE' : 'AVAILABLE';
          inv.conditionStatus = conditionStatus;
          inv.updatedAt = nowISO();
        }
        return {
          id: nextId(),
          tenantId,
          returnTransactionId: txnId,
          rentalOrderItemId,
          inventoryItemId: orderItem.inventoryItemId,
          conditionStatus,
          damageFee,
          note: raw.note ? String(raw.note) : null,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
      });
      const lateFee = num(body, 'lateFee');
      const txn: ReturnTransaction = {
        id: txnId,
        tenantId,
        branchId: str(body, 'branchId', true),
        rentalOrderId,
        createdBy: str(body, 'createdBy', true),
        returnDate: str(body, 'returnDate', true),
        lateFee,
        damageFee: damageTotal,
        totalAmount: lateFee + damageTotal,
        note: body.note ? String(body.note) : null,
        items,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      db.returnTransactions.unshift(txn);

      // Update parent order status + accumulated fees.
      order.lateFee += lateFee;
      order.damageFee += damageTotal;
      const active = order.items.filter((i) => i.status !== 'CANCELLED');
      const allReturned = active.every((i) => i.status === 'RETURNED');
      order.status = allReturned ? 'RETURNED' : 'PARTIALLY_RETURNED';
      if (allReturned) order.actualReturnDate = txn.returnDate;
      recomputeOrderTotal(order);
      order.updatedAt = nowISO();

      return txn;
    },
  },
  {
    method: 'GET',
    pattern: /^\/return-transactions\/([^/]+)$/,
    handler: ({ ids }) =>
      db.returnTransactions.find((t) => t.id === ids[0]) ?? notFound('Return transaction'),
  },
  {
    method: 'DELETE',
    pattern: /^\/return-transactions\/([^/]+)$/,
    noContent: true,
    handler: ({ ids }) => {
      db.returnTransactions = db.returnTransactions.filter((t) => t.id !== ids[0]);
    },
  },
];

export const routes: MockRoute[] = [
  ...authRoutes,
  ...branchRoutes,
  ...masterRoutes('sizes', () => db.sizes, 'Size'),
  ...masterRoutes('units', () => db.units, 'Unit'),
  ...masterRoutes('product-types', () => db.productTypes, 'Product type'),
  ...masterRoutes('product-groups', () => db.productGroups, 'Product group'),
  ...customerRoutes,
  ...productRoutes,
  ...inventoryRoutes,
  ...rentalOrderRoutes,
  ...returnTransactionRoutes,
];
