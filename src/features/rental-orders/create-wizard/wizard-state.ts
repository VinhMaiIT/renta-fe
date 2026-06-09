import type { RentalOrderCustomerInput } from '../api';

export type CustomerMode = 'EXISTING' | 'NEW';

export interface WizardLineItem {
  inventoryItemId: string;
  productId: string;
  /** Human-readable label for review (serial code). */
  serialCode: string;
  price: number;
}

export interface WizardState {
  customerMode: CustomerMode;
  /** Selected existing customer id (EXISTING mode). */
  customerId: string;
  /** Selected existing customer display label. */
  customerLabel: string;
  /** Inline new customer (NEW mode). */
  newCustomer: RentalOrderCustomerInput;
  items: WizardLineItem[];
  rentDate: string; // datetime-local value
  expectedReturnDate: string; // datetime-local value
  depositAmount: number;
  discountAmount: number;
  note: string;
  orderCode: string;
}

/** `RO-YYYYMMDD-XXXX` where the suffix is the last 4 digits of Date.now(). */
export function generateOrderCode(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ymd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const suffix = String(Date.now()).slice(-4);
  return `RO-${ymd}-${suffix}`;
}

function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function createInitialState(): WizardState {
  return {
    customerMode: 'EXISTING',
    customerId: '',
    customerLabel: '',
    newCustomer: { name: '', phone: '', address: '', note: '' },
    items: [],
    rentDate: toDateTimeLocal(new Date()),
    expectedReturnDate: '',
    depositAmount: 0,
    discountAmount: 0,
    note: '',
    orderCode: generateOrderCode(),
  };
}

export function itemsTotal(state: WizardState): number {
  return state.items.reduce((sum, item) => sum + (Number.isFinite(item.price) ? item.price : 0), 0);
}

export function orderTotal(state: WizardState): number {
  return Math.max(0, itemsTotal(state) - state.discountAmount);
}
