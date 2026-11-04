// ─── Per-table guest storage ──────────────────────────────────────────────────
// The cart and the guest's active orders live in localStorage, scoped to the
// table's QR token, so a refresh (or a second scan) doesn't lose them.
import { useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../../lib/storage';

const EMPTY_CART = { lines: [], notes: '' };
const cartKey = (token) => `wb:cart:${token}`;
const ordersKey = (token) => `wb:orders:${token}`;

/** Cart state: { lines: [{ id, qty, note }], notes }. */
export function useTableCart(token) {
  const [cart, setCart] = useState(() => (token ? readJSON(cartKey(token), EMPTY_CART) : EMPTY_CART));

  useEffect(() => {
    if (token) writeJSON(cartKey(token), cart);
  }, [token, cart]);

  const setLine = (id, patch) =>
    setCart((c) => {
      const existing = c.lines.find((l) => l.id === id);
      const lines = existing
        ? c.lines.map((l) => (l.id === id ? { ...l, ...patch } : l))
        : [...c.lines, { id, qty: 1, note: '', ...patch }];
      return { ...c, lines: lines.filter((l) => l.qty > 0) };
    });

  return {
    cart,
    add: (id, max = 20) => {
      const qty = cart.lines.find((l) => l.id === id)?.qty ?? 0;
      setLine(id, { qty: Math.min(qty + 1, max) });
    },
    setQty: (id, qty) => setLine(id, { qty }),
    setNote: (id, note) => setLine(id, { note }),
    setNotes: (notes) => setCart((c) => ({ ...c, notes })),
    /** Drop lines whose item no longer exists or is sold out; returns their ids. */
    prune: (isOrderable) => {
      const gone = cart.lines.filter((l) => !isOrderable(l.id)).map((l) => l.id);
      if (gone.length) setCart((c) => ({ ...c, lines: c.lines.filter((l) => isOrderable(l.id)) }));
      return gone;
    },
    clear: () => setCart(EMPTY_CART),
  };
}

/** Orders placed from this table on this phone: [{ publicId, code, at }]. */
export function readTableOrders(token) {
  return readJSON(ordersKey(token), []);
}

export function rememberTableOrder(token, order) {
  const today = new Date().toDateString();
  const kept = readTableOrders(token).filter((o) => new Date(o.at).toDateString() === today);
  writeJSON(ordersKey(token), [
    { publicId: order.public_id, code: order.code, at: order.created_at },
    ...kept.filter((o) => o.publicId !== order.public_id),
  ]);
}
