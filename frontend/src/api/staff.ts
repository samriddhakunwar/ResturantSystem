// ─── Staff API ────────────────────────────────────────────────────────────────
// Wrappers for the staff-only café endpoints (auth, kitchen board, tables & QR,
// cats, bookings, service requests). Shapes are the backend's, unconverted,
// apart from decimal strings → numbers where the UI does maths.

import { http, unwrap, staffToken } from './client';
import type { Paginated } from './types';

export interface StaffUser {
  id: number;
  username: string;
  first_name: string;
  is_staff: boolean;
}

export interface KitchenOrder {
  id: number;
  order_number: string;
  public_id: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  source: 'pos' | 'qr';
  table: number | null;
  table_number: string;
  confirmed_at: string | null;
  notes: string;
  total: number;
  items: { id: number; quantity: number; notes: string; menu_item_detail: { name: string } }[];
  created_at: string;
  updated_at: string;
}

export interface StaffTable {
  id: number;
  number: number;
  label: string;
  display_label: string;
  seats: number;
  qr_token: string;
  is_active: boolean;
}

export interface ServiceRequest {
  id: number;
  table: number;
  table_label: string;
  type: 'call_staff' | 'request_bill' | 'water';
  type_display: string;
  status: 'open' | 'resolved';
  created_at: string;
}

export interface StaffCat {
  id: number;
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
  display_order: number;
}

export interface Enquiry {
  id: number;
  cat: number;
  cat_name: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

export interface StaffBooking {
  id: number;
  name: string;
  phone: string;
  email: string;
  date: string;
  slot_start: string;
  party_size: number;
  kids_count: number;
  status: 'pending' | 'confirmed' | 'arrived' | 'cancelled' | 'no_show';
  notes: string;
  created_at: string;
}

type List<T> = Paginated<T> | T[];
const all = async <T>(path: string): Promise<T[]> => unwrap(await http.get<List<T>>(path));

export const authApi = {
  async login(username: string, password: string): Promise<StaffUser> {
    const res = await http.post<{ token: string; user: StaffUser }>('/auth/login/', { username, password });
    staffToken.set(res.token);
    return res.user;
  },
  async logout() {
    await http.post('/auth/logout/', {}).catch(() => {});
    staffToken.clear();
  },
  me: () => http.get<StaffUser>('/auth/me/'),
};

export const kitchenApi = {
  async board(): Promise<KitchenOrder[]> {
    const orders = await http.get<KitchenOrder[]>('/orders/orders/kitchen/');
    return orders.map((o) => ({ ...o, total: Number(o.total) }));
  },
  confirm: (id: number) => http.post(`/orders/orders/${id}/confirm/`, {}),
  setStatus: (id: number, status: KitchenOrder['status']) =>
    http.patch(`/orders/orders/${id}/update-status/`, { status }),
};

export const tablesApi = {
  list: () => all<StaffTable>('/tables/?page_size=100'),
  create: (data: Partial<StaffTable>) => http.post<StaffTable>('/tables/', data),
  update: (id: number, data: Partial<StaffTable>) => http.patch<StaffTable>(`/tables/${id}/`, data),
  remove: (id: number) => http.del(`/tables/${id}/`),
  regenerate: (id: number) => http.post<StaffTable>(`/tables/${id}/regenerate-token/`, {}),
  qr: (id: number, fmt: 'png' | 'svg') => http.blob(`/tables/${id}/qr.${fmt}`),
};

export const serviceApi = {
  open: () => all<ServiceRequest>('/tables/service-requests/?status=open&page_size=100'),
  resolve: (id: number) => http.post<ServiceRequest>(`/tables/service-requests/${id}/resolve/`, {}),
};

export const catsApi = {
  list: () => all<StaffCat>('/cats/?page_size=100'),
  /** `data` is FormData when a photo is attached, otherwise plain JSON. */
  save(id: number | null, data: FormData | Partial<StaffCat>) {
    const path = id ? `/cats/${id}/` : '/cats/';
    const method = id ? 'PATCH' : 'POST';
    return data instanceof FormData
      ? http.form<StaffCat>(path, data, method)
      : id
        ? http.patch<StaffCat>(path, data)
        : http.post<StaffCat>(path, data);
  },
  remove: (id: number) => http.del(`/cats/${id}/`),
  enquiries: () => all<Enquiry>('/cats/enquiries/?page_size=100'),
  setEnquiry: (id: number, status: Enquiry['status']) =>
    http.patch<Enquiry>(`/cats/enquiries/${id}/`, { status }),
};

export const bookingsApi = {
  forDay: (date: string) => all<StaffBooking>(`/bookings/?date=${date}&page_size=100`),
  setStatus: (id: number, status: StaffBooking['status']) =>
    http.patch<StaffBooking>(`/bookings/${id}/`, { status }),
};

export interface Expense {
  id: number;
  expense_date: string;
  category: 'ingredients' | 'labor' | 'utilities' | 'rent' | 'other';
  category_display: string;
  description: string;
  amount: number;
}

export const staffExpensesApi = {
  async recent(): Promise<Expense[]> {
    const list = await all<Expense>('/expenses/expenses/?page_size=100');
    return list.map((e) => ({ ...e, amount: Number(e.amount) }));
  },
  create: (data: Omit<Expense, 'id' | 'category_display'>) => http.post<Expense>('/expenses/expenses/', data),
  remove: (id: number) => http.del(`/expenses/expenses/${id}/`),
};
