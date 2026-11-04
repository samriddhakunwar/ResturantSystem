// ─── Backend API Types ────────────────────────────────────────────────────────
// TypeScript mirrors of the Django REST Framework serializers exposed under
// /api/v1/. Decimal fields arrive as JSON strings (e.g. "550.00").

/** DRF StandardResultsSetPagination envelope. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Menu ──────────────────────────────────────────────────────────────────────
export interface ApiCategory {
  id: number;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
  items_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ApiMenuItem {
  id: number;
  category: number;
  category_name: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_available: boolean;
  display_order: number;
  dietary_tags?: string[];
  is_featured?: boolean;
  recommended_by?: number | null;
  recommended_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ── Orders ──────────────────────────────────────────────────────────────────
export type ApiOrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export interface ApiOrderItem {
  id?: number;
  menu_item: number;
  menu_item_detail?: ApiMenuItem;
  quantity: number;
  unit_price?: string;
  item_total?: string;
  notes?: string;
}

export interface ApiOrder {
  id: number;
  order_number: string;
  public_id?: string;
  status: ApiOrderStatus;
  source?: 'pos' | 'qr';
  table?: number | null;
  table_number: number | null;
  confirmed_at?: string | null;
  notes: string;
  subtotal: string;
  total: string;
  items: ApiOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  table_number: number | null;
  notes: string;
  items: { menu_item: number; quantity: number; notes?: string }[];
}

// ── Billing ─────────────────────────────────────────────────────────────────
export interface ApiBill {
  id: number;
  bill_number: string;
  order: number;
  order_detail?: { order_number: string; table_number: number | null };
  subtotal: string;
  tax_percent: string;
  tax_amount: string;
  discount_percent: string;
  discount_amount: string;
  service_charge_percent: string;
  service_charge_amount: string;
  grand_total: string;
  notes: string;
  is_paid: boolean;
  total_paid: string;
  payments: ApiPayment[];
  created_at: string;
  updated_at: string;
}

export type ApiPaymentMethod = 'cash' | 'esewa' | 'khalti' | 'card' | 'bank_transfer';

export interface ApiPayment {
  id: number;
  bill: number;
  method: ApiPaymentMethod;
  method_display?: string;
  amount: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

// ── Reports ─────────────────────────────────────────────────────────────────
export interface ApiDailyReport {
  id: number;
  report_date: string;
  total_orders: number;
  total_sales: string;
  average_order_value: string;
  highest_order_amount: string;
  lowest_order_amount: string;
}

export interface ApiMonthlySummary {
  year: number;
  month: number;
  total_days_with_sales: number;
  total_orders: number;
  total_sales: string;
  average_daily_sales: string;
  average_order_value: string;
  daily_reports: ApiDailyReport[];
}

// ── Printers ────────────────────────────────────────────────────────────────
export type PrinterRole = 'kitchen' | 'billing' | 'both';

export interface ApiPrinter {
  id: number;
  name: string;
  connection_type: 'usb' | 'lan';
  role: PrinterRole;
  is_active: boolean;
  jobs_count?: number;
  created_at: string;
}

export interface ApiPrintJob {
  id: number;
  printer: number;
  printer_name?: string;
  job_type: 'kitchen_ticket' | 'customer_bill' | 'test_page';
  order: number | null;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
}
