// ─── HTTP Client ──────────────────────────────────────────────────────────────
// Thin fetch wrapper around the Django REST backend. Reads VITE_API_URL; when it
// is absent the app runs in "offline" mode and callers fall back to mock data.

import type { Paginated } from './types';

export const API_BASE: string = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export const isApiConfigured: boolean = API_BASE.length > 0;

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// ── Staff token ──────────────────────────────────────────────────────────────
// DRF TokenAuthentication: `Authorization: Token <key>`. Public endpoints
// ignore it. A 401 on a staff call clears it and sends the user to login.
const TOKEN_KEY = 'wb:staff-token';

export const staffToken = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

function onUnauthorized(path: string) {
  if (path.startsWith('/public/') || path.startsWith('/auth/login')) return;
  staffToken.clear();
  const here = window.location.pathname;
  if (here.startsWith('/staff') && here !== '/staff/login') {
    window.location.assign(`/staff/login?next=${encodeURIComponent(here)}`);
  }
}

async function send(path: string, init: RequestInit = {}): Promise<Response> {
  if (!isApiConfigured) {
    throw new ApiError(0, 'API not configured (VITE_API_URL is empty)', null);
  }
  const token = staffToken.get();
  const headers: Record<string, string> = {
    // FormData sets its own multipart boundary.
    ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  };
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, `Network error — ${path}`, null);
  }
  if (res.status === 401) onUnauthorized(path);
  return res;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await send(path, init);
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text; // non-JSON error page
  }

  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText} — ${path}`, data);
  }
  return data as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path: string) => request<void>(path, { method: 'DELETE' }),
  /** Multipart upload (cat photos); `method` is POST or PATCH. */
  form: <T>(path: string, body: FormData, method = 'POST') => request<T>(path, { method, body }),
  /** Binary download with the staff token (QR PNG/SVG). */
  async blob(path: string): Promise<Blob> {
    const res = await send(path);
    if (!res.ok) throw new ApiError(res.status, `${res.status} ${res.statusText} — ${path}`, null);
    return res.blob();
  },
};

/** Collapse a possibly-paginated response into a plain array. */
export function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}
