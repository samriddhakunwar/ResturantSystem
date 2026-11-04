// ─── Order Tracker ────────────────────────────────────────────────────────────
// /t/:token/order/:publicId — live status of a guest's QR order. Polls every
// 5s until the order is served or cancelled, plus the table's service buttons.
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import OrderStatus from '../../components/ui/OrderStatus';
import SectionPanel from '../../components/ui/SectionPanel';
import { ApiError } from '../../api/client';
import { fieldErrors, publicApi } from '../../api/public';
import { formatRs } from '../../lib/format';
import usePolling from '../../lib/usePolling';
import GuestMessage from './GuestMessage';

const SERVICE = [
  { type: 'call_staff', label: 'Call staff', done: 'Someone is on their way.' },
  { type: 'request_bill', label: 'Request bill', done: 'Your bill is coming.' },
  { type: 'water', label: 'Water please', done: 'Water is on its way.' },
];
const FINAL = ['served', 'cancelled'];

export default function OrderTracker() {
  const { token, publicId } = useParams();
  const [order, setOrder] = useState(null);
  const [missing, setMissing] = useState(false);
  const [asked, setAsked] = useState({});
  const [serviceMsg, setServiceMsg] = useState('');

  usePolling(
    () =>
      publicApi
        .order(publicId)
        .then(setOrder)
        .catch((err) => err instanceof ApiError && err.status === 404 && setMissing(true)),
    5000,
    !missing && !FINAL.includes(order?.step),
  );

  const ask = async ({ type, done }) => {
    setServiceMsg('');
    try {
      await publicApi.serviceRequest(token, type);
      setAsked((a) => ({ ...a, [type]: true }));
      setServiceMsg(done);
    } catch (err) {
      setServiceMsg(fieldErrors(err)._form ?? 'Please wave to our staff instead.');
    }
  };

  if (missing) {
    return (
      <GuestMessage title="We couldn't find that order" action={<Button to={`/t/${token}`}>Back to the menu</Button>}>
        <p className="m-0">Please ask our staff if something seems off.</p>
      </GuestMessage>
    );
  }
  if (!order) return <GuestMessage title="Fetching your order…" pose="grooming" />;

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-10 pt-6">
      <p className="m-0 text-sm font-bold text-muted">
        Order #{order.code}
        {order.table_label && ` · ${order.table_label}`}
      </p>

      <OrderStatus
        step={order.step}
        subtitle={order.step === 'received' ? 'Staff will confirm it in a moment.' : undefined}
      />

      <SectionPanel title="What you ordered">
        <ul className="m-0 list-none space-y-2 p-0 text-left">
          {order.items.map((i, n) => (
            <li key={n} className="flex justify-between gap-3 tabular-nums">
              <span>
                {i.quantity} × {i.name}
                {i.notes && <span className="block text-sm text-muted">{i.notes}</span>}
              </span>
              <span>{formatRs(i.item_total)}</span>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-4 flex justify-between border-t border-line pt-3 font-bold tabular-nums">
          <span>Total</span>
          <span className="text-olive-strong">{formatRs(order.charges.total)}</span>
        </p>
        <p className="m-0 mt-1 text-left text-xs text-muted">Includes 10% service charge and 13% VAT.</p>
      </SectionPanel>

      <section aria-labelledby="help-title" className="space-y-3">
        <h2 id="help-title" className="m-0 font-display text-xl font-extrabold text-olive-dark">Need anything?</h2>
        <div className="flex flex-wrap gap-2">
          {SERVICE.map((s) => (
            <Button key={s.type} size="sm" variant="outline" onClick={() => ask(s)} disabled={asked[s.type]}>
              {s.label}
            </Button>
          ))}
        </div>
        <p role="status" className="m-0 min-h-5 text-sm font-semibold text-olive-strong">{serviceMsg}</p>
      </section>

      <Button block variant="outline" to={`/t/${token}`}>Order more</Button>
    </div>
  );
}
