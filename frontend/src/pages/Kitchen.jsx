// ─── Kitchen Board ────────────────────────────────────────────────────────────
// New / Preparing / Ready / Served columns, refreshed every 5s. A new QR order
// chimes (mute toggle remembered on this device) and shows a toast. Confirming
// a QR order prints its kitchen ticket on the backend.
import { useCallback, useRef, useState } from 'react';
import { Clock, Volume2, VolumeX } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import CatSilhouette from '../components/decor/CatSilhouette';
import { isApiConfigured } from '../api/client';
import { fieldErrors } from '../api/public';
import { kitchenApi } from '../api/staff';
import usePolling from '../lib/usePolling';
import { readJSON, writeJSON } from '../lib/storage';

const COLUMNS = [
  { key: 'pending', title: 'New' },
  { key: 'preparing', title: 'Preparing' },
  { key: 'ready', title: 'Ready' },
  { key: 'served', title: 'Served today' },
];

/** The one next step for an order card, or null. */
function nextAction(order) {
  if (order.status === 'pending') {
    return order.confirmed_at
      ? { label: 'Start brewing', run: () => kitchenApi.setStatus(order.id, 'preparing') }
      : { label: 'Confirm & print', run: () => kitchenApi.confirm(order.id) };
  }
  if (order.status === 'preparing') return { label: 'Ready', run: () => kitchenApi.setStatus(order.id, 'ready') };
  if (order.status === 'ready') return { label: 'Served', run: () => kitchenApi.setStatus(order.id, 'served') };
  return null;
}

function chime() {
  try {
    const ctx = new AudioContext();
    [0, 0.18].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = i ? 990 : 660;
      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.25);
    });
  } catch {
    // No audio (autoplay policy before first click) — the toast still shows.
  }
}

const minutesAgo = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));

function OrderTicket({ order, onAction, busy }) {
  const action = nextAction(order);
  const waiting = minutesAgo(order.created_at);
  return (
    <article className="rounded-md border border-line bg-cream p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="m-0 font-display text-lg font-extrabold text-charcoal">
            {order.table_number ? `Table ${order.table_number}` : 'Counter'}
          </p>
          <p className="m-0 text-xs text-muted">#{order.order_number}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Chip tone={order.source === 'qr' ? 'new' : 'neutral'}>{order.source === 'qr' ? 'QR' : 'POS'}</Chip>
          {order.status === 'pending' && !order.confirmed_at && <Chip tone="allergen">Needs confirming</Chip>}
        </div>
      </div>
      <ul className="m-0 mt-3 list-none space-y-1 p-0 text-sm">
        {order.items.map((i) => (
          <li key={i.id}>
            <span className="font-bold">{i.quantity} ×</span> {i.menu_item_detail?.name}
            {i.notes && <span className="block pl-5 text-xs font-semibold text-ginger-ink">{i.notes}</span>}
          </li>
        ))}
      </ul>
      {order.notes && <p className="m-0 mt-2 rounded-sm bg-ginger-soft px-2 py-1 text-xs font-semibold text-ginger-ink">{order.notes}</p>}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={`flex items-center gap-1 text-xs ${waiting >= 15 && order.status !== 'served' ? 'font-bold text-danger' : 'text-muted'}`}>
          <Clock size={12} aria-hidden="true" /> {waiting} min ago
        </span>
        {action && (
          <Button size="sm" disabled={busy} onClick={() => onAction(order, action)}>
            {action.label}
          </Button>
        )}
      </div>
    </article>
  );
}

export default function Kitchen() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState('');
  const [muted, setMuted] = useState(() => readJSON('wb:kitchen-muted', false));
  const seen = useRef(null); // QR order ids already shown

  const load = useCallback(async () => {
    try {
      const list = await kitchenApi.board();
      const qrIds = list.filter((o) => o.source === 'qr').map((o) => o.id);
      if (seen.current) {
        const fresh = list.filter((o) => o.source === 'qr' && !seen.current.has(o.id));
        if (fresh.length) {
          setToast(
            fresh.length === 1
              ? `New QR order from ${fresh[0].table_number ? `Table ${fresh[0].table_number}` : 'a table'}`
              : `${fresh.length} new QR orders`,
          );
          if (!readJSON('wb:kitchen-muted', false)) chime();
        }
      }
      seen.current = new Set([...(seen.current ?? []), ...qrIds]);
      setOrders(list);
      setError('');
    } catch (err) {
      setError(fieldErrors(err)._form ?? 'Could not refresh the board.');
    }
  }, []);
  usePolling(load, 5000, isApiConfigured);

  const run = async (order, action) => {
    setBusyId(order.id);
    try {
      await action.run();
      await load();
    } catch (err) {
      const e = fieldErrors(err);
      setError(e._form || e.status || Object.values(e)[0]);
    } finally {
      setBusyId(null);
    }
  };

  const toggleMute = () => {
    writeJSON('wb:kitchen-muted', !muted);
    setMuted(!muted);
  };

  if (!isApiConfigured) {
    return (
      <div>
        <PageHeader title="Kitchen" />
        <p className="text-muted">The kitchen board needs the backend. Set VITE_API_URL and reload.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Kitchen"
        subtitle="Refreshes every 5 seconds."
        action={
          <Button size="sm" variant="outline" onClick={toggleMute} active={muted}>
            {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
            <span className="ml-2">{muted ? 'Sound off' : 'Sound on'}</span>
          </Button>
        }
      />

      <div aria-live="polite" className="fixed bottom-6 right-6 z-50">
        {toast && (
          <div role="status" className="flex items-center gap-3 rounded-md bg-olive-dark px-4 py-3 text-cream shadow-lift">
            <span className="font-bold">{toast}</span>
            <button type="button" onClick={() => setToast('')} className="border-0 bg-transparent text-sm font-bold text-cream underline">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {error && <p role="alert" className="mb-4 rounded-sm bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">{error}</p>}

      {orders === null ? (
        <p className="text-muted">Loading the board…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const list = orders.filter((o) => o.status === col.key);
            return (
              <section key={col.key} aria-labelledby={`col-${col.key}`} className="rounded-lg bg-panel p-3">
                <h2 id={`col-${col.key}`} className="m-0 mb-3 flex items-center justify-between px-1 font-display text-xl font-extrabold text-olive-dark">
                  {col.title}
                  <span className="rounded-full bg-cream px-2.5 text-sm text-charcoal">{list.length}</span>
                </h2>
                <div className="space-y-3">
                  {list.map((o) => (
                    <OrderTicket key={o.id} order={o} onAction={run} busy={busyId === o.id} />
                  ))}
                  {list.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted">
                      <CatSilhouette pose="lying" className="mx-auto mb-2 h-10 w-auto opacity-70" />
                      Nothing here
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
