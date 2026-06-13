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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isApiConfigured) {
    throw new ApiError(0, 'API not configured (VITE_API_URL is empty)', null);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

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
};

/** Collapse a possibly-paginated response into a plain array. */
export function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}
