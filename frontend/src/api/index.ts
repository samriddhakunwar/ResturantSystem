// ─── API Service Layer ──────────────────────────────────────────────────────
// High-level, view-model-returning functions used by the React app. Each maps
// onto a DRF endpoint under /api/v1/ and converts shapes via ./adapters.

import { http, unwrap, isApiConfigured, ApiError } from './client';
import {
  toMenuVM,
  toOrderVM,
  toInvoiceVM,
  toCreateOrderPayload,
  toBackendStatus,
  toBackendMethod,
} from './adapters';
import type { InvoiceVM, MenuVM, OrderVM } from './adapters';
import type {
  ApiBill,
  ApiCategory,
  ApiDailyReport,
  ApiMenuItem,
  ApiMonthlySummary,
  ApiOrder,
  ApiPrinter,
  ApiPrintJob,
  Paginated,
  PrinterRole,
} from './types';

export { isApiConfigured, ApiError };
export type { MenuVM, OrderVM, InvoiceVM };

export interface CategoryVM {
  id: number;
  name: string;
}

export interface MonthSalesVM {
  month: string;
  sales: number;
  orders: number;
}

// ── Menu ──────────────────────────────────────────────────────────────────────
export const menuApi = {
  async list(): Promise<MenuVM[]> {
    const data = await http.get<Paginated<ApiMenuItem> | ApiMenuItem[]>(
      '/menu/menu-items/?page_size=100',
    );
    return unwrap(data).map(toMenuVM);
  },

  async categories(): Promise<CategoryVM[]> {
    const data = await http.get<Paginated<ApiCategory> | ApiCategory[]>(
      '/menu/categories/?page_size=100',
    );
    return unwrap(data).map((c) => ({ id: c.id, name: c.name }));
  },

  async create(input: {
    name: string;
    category: number;
    price: number;
    description?: string;
    is_available?: boolean;
    dietary_tags?: string[];
    is_featured?: boolean;
    recommended_by?: number | null;
  }): Promise<MenuVM> {
    const created = await http.post<ApiMenuItem>('/menu/menu-items/', input);
    return toMenuVM(created);
  },

  async update(id: number, patch: Record<string, unknown>): Promise<MenuVM> {
    const updated = await http.patch<ApiMenuItem>(`/menu/menu-items/${id}/`, patch);
    return toMenuVM(updated);
  },

  remove(id: number): Promise<void> {
    return http.del(`/menu/menu-items/${id}/`);
  },
};

// ── Orders ──────────────────────────────────────────────────────────────────
export const ordersApi = {
  // The list endpoint uses a lightweight serializer (no items/notes), so we
  // hydrate each order via its detail endpoint to get line items + notes.
  async list(): Promise<OrderVM[]> {
    const data = await http.get<Paginated<{ id: number }> | { id: number }[]>(
      '/orders/orders/?page_size=100',
    );
    const rows = unwrap(data);
    const full = await Promise.all(
      rows.map((r) => http.get<ApiOrder>(`/orders/orders/${r.id}/`)),
    );
    return full.map(toOrderVM);
  },

  async create(
    cartItems: { id: number; qty: number }[],
    customer: string,
    table: string,
    notes: string,
  ): Promise<OrderVM> {
    const payload = toCreateOrderPayload(cartItems, customer, table, notes);
    const created = await http.post<ApiOrder>('/orders/orders/', payload);
    return toOrderVM(created);
  },

  async updateStatus(backendId: number, feStatus: string): Promise<OrderVM> {
    const updated = await http.patch<ApiOrder>(
      `/orders/orders/${backendId}/update-status/`,
      { status: toBackendStatus(feStatus) },
    );
    return toOrderVM(updated);
  },
};

// ── Billing ─────────────────────────────────────────────────────────────────
export const billingApi = {
  // List serializer omits the order FK / tax breakdown / payments, so hydrate
  // each bill via its detail endpoint, then join to the already-loaded orders.
  async list(orders: OrderVM[] = []): Promise<InvoiceVM[]> {
    const data = await http.get<Paginated<{ id: number }> | { id: number }[]>(
      '/billing/bills/?page_size=100',
    );
    const rows = unwrap(data);
    const full = await Promise.all(
      rows.map((r) => http.get<ApiBill>(`/billing/bills/${r.id}/`)),
    );
    const byId = new Map(orders.map((o) => [o.backendId, o]));
    return full.map((bill) => toInvoiceVM(bill, byId.get(bill.order)));
  },

  /** Record a payment against a bill for its full outstanding total. */
  async pay(billId: number, amount: number, feMethod: string): Promise<void> {
    await http.post('/billing/payments/', {
      bill: billId,
      method: toBackendMethod(feMethod),
      amount: amount.toFixed(2),
    });
  },
};

// ── Reports ─────────────────────────────────────────────────────────────────
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const reportsApi = {
  monthlySummary(year: number, month: number): Promise<ApiMonthlySummary> {
    return http.get<ApiMonthlySummary>(
      `/reports/daily/monthly-summary/?year=${year}&month=${month}`,
    );
  },

  /**
   * Aggregate every daily report in `year` into a 12-month sales series for the
   * dashboard chart. Returns [] when no reports exist (caller keeps mock data).
   */
  async salesByMonth(year: number): Promise<MonthSalesVM[]> {
    const data = await http.get<Paginated<ApiDailyReport> | ApiDailyReport[]>(
      `/reports/daily/?date_from=${year}-01-01&date_to=${year}-12-31&page_size=400`,
    );
    const rows = unwrap(data);
    if (rows.length === 0) return [];

    const buckets = MONTH_LABELS.map((month) => ({ month, sales: 0, orders: 0 }));
    for (const r of rows) {
      const idx = Number(r.report_date.slice(5, 7)) - 1; // "YYYY-MM-DD" → month
      if (idx >= 0 && idx < 12) {
        buckets[idx].sales += Number(r.total_sales);
        buckets[idx].orders += r.total_orders;
      }
    }
    return buckets;
  },
};

// ── Printers ────────────────────────────────────────────────────────────────
export interface PrinterVM {
  id: number;
  name: string;
  role: PrinterRole;
  connectionType: 'usb' | 'lan';
  isActive: boolean;
}

export const printersApi = {
  async list(): Promise<PrinterVM[]> {
    const data = await http.get<Paginated<ApiPrinter> | ApiPrinter[]>(
      '/printers/printers/?page_size=100',
    );
    return unwrap(data).map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      connectionType: p.connection_type,
      isActive: p.is_active,
    }));
  },

  /** Pick the best active printer for a role, falling back to any active one. */
  pickPrinter(printers: PrinterVM[], want: 'kitchen' | 'billing'): PrinterVM | null {
    const active = printers.filter((p) => p.isActive);
    return (
      active.find((p) => p.role === want) ??
      active.find((p) => p.role === 'both') ??
      active[0] ??
      null
    );
  },

  async printKitchenTicket(printerId: number, orderBackendId: number): Promise<ApiPrintJob> {
    return http.post<ApiPrintJob>(
      `/printers/printers/${printerId}/print-kitchen-ticket/`,
      { order_id: orderBackendId },
    );
  },

  async printBill(printerId: number, orderBackendId: number): Promise<ApiPrintJob> {
    return http.post<ApiPrintJob>(
      `/printers/printers/${printerId}/print-bill/`,
      { order_id: orderBackendId },
    );
  },

  create(input: Record<string, unknown>): Promise<ApiPrinter> {
    return http.post<ApiPrinter>('/printers/printers/', input);
  },

  setActive(id: number, isActive: boolean): Promise<ApiPrinter> {
    return http.patch<ApiPrinter>(`/printers/printers/${id}/`, { is_active: isActive });
  },

  remove(id: number): Promise<void> {
    return http.del(`/printers/printers/${id}/`);
  },

  testPrint(id: number): Promise<ApiPrintJob> {
    return http.post<ApiPrintJob>(`/printers/printers/${id}/test-print/`, {});
  },
};

// ── Expenses ────────────────────────────────────────────────────────────────
export interface ExpenseMonthVM {
  month: string;
  ingredients: number;
  labor: number;
  utilities: number;
  rent: number;
  other: number;
  total: number;
}

export const expensesApi = {
  // 12-month, per-category breakdown for the dashboard chart.
  byMonth(year: number): Promise<ExpenseMonthVM[]> {
    return http.get<ExpenseMonthVM[]>(
      `/expenses/expenses/monthly-breakdown/?year=${year}`,
    );
  },
};
