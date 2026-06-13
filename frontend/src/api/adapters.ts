// ─── Adapters ─────────────────────────────────────────────────────────────────
// Translate between the Django REST backend shapes and the view-models the
// (mock-era) React components already expect. All FE-facing prices are numbers;
// statuses are Title-case; the backend's snake_case / Decimal-string / FK-id
// conventions never leak past this file.

import type {
  ApiBill,
  ApiMenuItem,
  ApiOrder,
  ApiOrderStatus,
  ApiPaymentMethod,
  CreateOrderPayload,
} from './types';

// ── View-models (the component-facing shapes) ──────────────────────────────────
export interface MenuVM {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  image: string | null;
  emoji: string;
  badge: string | null;
  badgeColor: string | null;
}

export interface OrderItemVM {
  name: string;
  qty: number;
  price: number;
}

export interface OrderVM {
  id: string;
  backendId: number;
  customer: string;
  table: string;
  status: 'Pending' | 'Preparing' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid';
  paymentMethod: string | null;
  amount: number;
  time: string;
  notes: string;
  items: OrderItemVM[];
}

export interface InvoiceVM {
  id: string;
  billId: number;
  orderId: number;
  customer: string;
  table: string;
  date: string;
  time: string;
  paymentStatus: 'Paid' | 'Unpaid';
  paymentMethod: string | null;
  items: OrderItemVM[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
}

// ── Status & payment-method mappings ────────────────────────────────────────
const BE_TO_FE_STATUS: Record<ApiOrderStatus, OrderVM['status']> = {
  pending: 'Pending',
  preparing: 'Preparing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Backend has no "Ready" state — the FE board collapses it onto "preparing".
const FE_TO_BE_STATUS: Record<string, ApiOrderStatus> = {
  Pending: 'pending',
  Preparing: 'preparing',
  Ready: 'preparing',
  Completed: 'completed',
  Cancelled: 'cancelled',
};

const FE_TO_BE_METHOD: Record<string, ApiPaymentMethod> = {
  Cash: 'cash',
  Card: 'card',
  Online: 'esewa',
  eSewa: 'esewa',
  Khalti: 'khalti',
  Bank: 'bank_transfer',
};

export const toBackendStatus = (s: string): ApiOrderStatus => FE_TO_BE_STATUS[s] ?? 'pending';
export const toBackendMethod = (m: string): ApiPaymentMethod => FE_TO_BE_METHOD[m] ?? 'cash';

// ── Small helpers ───────────────────────────────────────────────────────────
const num = (v: string | number | null | undefined): number => Number(v ?? 0);

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const tableLabel = (n: number | null): string => (n == null ? 'Takeaway' : `Table ${n}`);

// The backend has no customer field, so we stash it as a "Customer:" line in
// the order notes and recover it on read.
export function buildNotes(customer: string, notes: string): string {
  const lines: string[] = [];
  if (customer.trim()) lines.push(`Customer: ${customer.trim()}`);
  if (notes.trim()) lines.push(notes.trim());
  return lines.join('\n');
}

function parseCustomer(notes: string): { customer: string; rest: string } {
  const match = notes.match(/^Customer:\s*(.+)$/m);
  if (!match) return { customer: '', rest: notes };
  const rest = notes.replace(match[0], '').trim();
  return { customer: match[1].trim(), rest };
}

// ── Menu ──────────────────────────────────────────────────────────────────────
export function toMenuVM(item: ApiMenuItem): MenuVM {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    category: item.category_name,
    price: num(item.price),
    available: item.is_available,
    image: item.image,
    emoji: '🍽️',
    badge: null,
    badgeColor: null,
  };
}

// ── Orders ──────────────────────────────────────────────────────────────────
export function toOrderVM(order: ApiOrder): OrderVM {
  const { customer } = parseCustomer(order.notes ?? '');
  return {
    id: order.order_number,
    backendId: order.id,
    customer: customer || 'Walk-in Customer',
    table: tableLabel(order.table_number),
    status: BE_TO_FE_STATUS[order.status] ?? 'Pending',
    paymentStatus: 'Unpaid', // resolved against bills where available
    paymentMethod: null,
    amount: num(order.total),
    time: formatTime(order.created_at),
    notes: order.notes ?? '',
    items: (order.items ?? []).map((it) => ({
      name: it.menu_item_detail?.name ?? `#${it.menu_item}`,
      qty: it.quantity,
      price: num(it.unit_price ?? it.menu_item_detail?.price),
    })),
  };
}

/** Build the nested-item create payload the backend OrderSerializer expects. */
export function toCreateOrderPayload(
  cartItems: { id: number; qty: number }[],
  customer: string,
  table: string,
  notes: string,
): CreateOrderPayload {
  const digits = table.replace(/\D/g, '');
  return {
    table_number: digits ? Number(digits) : null,
    notes: buildNotes(customer, notes),
    items: cartItems.map((c) => ({ menu_item: c.id, quantity: c.qty })),
  };
}

// ── Billing ─────────────────────────────────────────────────────────────────
/** Combine a bill with its already-loaded order view-model into an invoice. */
export function toInvoiceVM(bill: ApiBill, order?: OrderVM): InvoiceVM {
  const lastPayment = bill.payments?.[bill.payments.length - 1];
  return {
    id: bill.bill_number,
    billId: bill.id,
    orderId: bill.order,
    customer: order?.customer ?? 'Walk-in Customer',
    table: order?.table ?? tableLabel(bill.order_detail?.table_number ?? null),
    date: new Date(bill.created_at).toLocaleDateString('en-CA'),
    time: formatTime(bill.created_at),
    paymentStatus: bill.is_paid ? 'Paid' : 'Unpaid',
    paymentMethod: lastPayment?.method_display ?? null,
    items: order?.items ?? [],
    subtotal: num(bill.subtotal),
    taxRate: num(bill.tax_percent) / 100,
    tax: num(bill.tax_amount),
    total: num(bill.grand_total),
  };
}
