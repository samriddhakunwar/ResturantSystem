// ─── Guest-facing API ─────────────────────────────────────────────────────────
// Wrappers for /api/v1/public/* (no login). Shapes mirror apps/cafe on the
// backend; prices arrive as decimal strings and are converted to numbers here.

import { http, ApiError } from './client';

export interface CafeConfig {
  cafe_name: string;
  tagline: string;
  wifi: string;
  opening_hours: string[];
  social: { facebook: string; instagram: string; tiktok: string };
  currency: string;
  public_base_url: string;
  max_qty_per_line: number;
  booking: { slot_minutes: number; max_guests_per_slot: number };
}

export interface PublicMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  is_available: boolean;
  is_featured: boolean;
  dietary_tags: string[];
  recommended_by: { name: string; slug: string } | null;
}

export interface PublicCategory {
  id: number;
  name: string;
  description: string;
  items: PublicMenuItem[];
}

export interface GuestOrder {
  public_id: string;
  code: string;
  step: 'received' | 'confirmed' | 'brewing' | 'ready' | 'served' | 'cancelled';
  table_label: string | null;
  notes: string;
  items: { name: string; quantity: number; unit_price: number; item_total: number; notes: string }[];
  subtotal: number;
  charges: {
    service_charge_percent: number;
    service_charge: number;
    vat_percent: number;
    vat: number;
    discount: number;
    total: number;
  };
  created_at: string;
}

export interface PublicCat {
  name: string;
  slug: string;
  photo: string | null;
  photo_alt: string;
  age_years: number;
  age_months: number;
  sex: 'girl' | 'boy';
  breed_or_look: string;
  personality_tags: string[];
  favourite_toy: string;
  likes: string;
  dislikes: string;
  bio: string;
  adoption_status: 'resident' | 'available' | 'reserved' | 'adopted';
  is_present_today: boolean;
}

export interface Slot {
  start: string;
  booked: number;
  capacity: number;
  remaining: number;
}

export type ServiceRequestType = 'call_staff' | 'request_bill' | 'water';

const num = (v: unknown) => Number(v ?? 0);

function toOrder(o: GuestOrder): GuestOrder {
  return {
    ...o,
    subtotal: num(o.subtotal),
    items: o.items.map((i) => ({ ...i, unit_price: num(i.unit_price), item_total: num(i.item_total) })),
    charges: Object.fromEntries(
      Object.entries(o.charges).map(([k, v]) => [k, num(v)]),
    ) as GuestOrder['charges'],
  };
}

export const publicApi = {
  config: () => http.get<CafeConfig>('/public/config/'),

  async menu(): Promise<PublicCategory[]> {
    const cats = await http.get<PublicCategory[]>('/public/menu/');
    return cats.map((c) => ({ ...c, items: c.items.map((i) => ({ ...i, price: num(i.price) })) }));
  },

  table: (token: string) => http.get<{ number: number; label: string }>(`/public/tables/${token}/`),

  async placeOrder(
    token: string,
    payload: { items: { menu_item: number; quantity: number; notes: string }[]; notes: string },
  ): Promise<GuestOrder> {
    return toOrder(await http.post<GuestOrder>(`/public/tables/${token}/orders/`, payload));
  },

  async order(publicId: string): Promise<GuestOrder> {
    return toOrder(await http.get<GuestOrder>(`/public/orders/${publicId}/`));
  },

  serviceRequest: (token: string, type: ServiceRequestType) =>
    http.post<{ id: number; type: ServiceRequestType; status: string }>(
      `/public/tables/${token}/service-requests/`,
      { type },
    ),

  cats: (params = '') => http.get<PublicCat[]>(`/public/cats/${params}`),
  cat: (slug: string) => http.get<PublicCat>(`/public/cats/${slug}/`),
  enquire: (slug: string, data: { name: string; phone: string; email: string; message: string }) =>
    http.post(`/public/cats/${slug}/enquiries/`, data),

  slots: (date: string) =>
    http.get<{ date: string; slots: Slot[] }>(`/public/bookings/available-slots/?date=${date}`),
  book: (data: Record<string, unknown>) => http.post<{ id: number }>('/public/bookings/', data),
};

/**
 * Flatten a DRF validation error into { field: "first message" } so forms can
 * show it next to the right input. Non-field errors land on `_form`.
 */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError)) return { _form: 'Something went wrong. Please try again.' };
  if (err.status === 0) return { _form: "We can't reach the café system right now. Please ask our staff." };
  if (err.status === 429) return { _form: 'Too many tries in a row. Please wait a minute and try again.' };
  const body = err.body as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return { _form: 'Something went wrong. Please try again.' };
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    const first = Array.isArray(value) ? value[0] : value;
    const msg = typeof first === 'object' && first ? Object.values(first).flat()[0] : first;
    out[key === 'non_field_errors' || key === 'detail' ? '_form' : key] = String(msg);
  }
  return out;
}
