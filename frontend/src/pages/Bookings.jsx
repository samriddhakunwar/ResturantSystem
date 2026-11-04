// ─── Bookings (staff) ─────────────────────────────────────────────────────────
// One day at a time: every slot with its capacity, and the bookings in it
// with status actions (confirm, arrived, no-show, cancel).
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import TextField from '../components/ui/TextField';
import { fieldErrors, publicApi } from '../api/public';
import { bookingsApi } from '../api/staff';
import { plural } from '../lib/format';

const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', arrived: 'Arrived', cancelled: 'Cancelled', no_show: 'No-show' };
const ACTIONS = {
  pending: [['confirmed', 'Confirm'], ['cancelled', 'Cancel']],
  confirmed: [['arrived', 'Arrived'], ['no_show', 'No-show'], ['cancelled', 'Cancel']],
  arrived: [],
  cancelled: [['confirmed', 'Restore']],
  no_show: [['arrived', 'Arrived after all']],
};

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const shiftDay = (iso, days) => {
  const d = new Date(`${iso}T00:00`);
  d.setDate(d.getDate() + days);
  return isoDay(d);
};

export default function Bookings() {
  const [date, setDate] = useState(isoDay(new Date()));
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, b] = await Promise.all([publicApi.slots(date), bookingsApi.forDay(date)]);
      setSlots(s.slots);
      setBookings(b);
      setError('');
    } catch (err) {
      setError(fieldErrors(err)._form);
    }
  }, [date]);
  useEffect(() => {
    setBookings(null);
    load();
  }, [load]);

  const setStatus = async (b, status) => {
    try {
      await bookingsApi.setStatus(b.id, status);
      await load();
    } catch (err) {
      setError(fieldErrors(err)._form ?? 'That didn’t work.');
    }
  };

  // Bookings whose slot isn't in today's list (hours changed) still show.
  const starts = [...new Set([...slots.map((s) => s.start), ...(bookings ?? []).map((b) => b.slot_start.slice(0, 5))])].sort();
  const guests = (bookings ?? []).filter((b) => !['cancelled', 'no_show'].includes(b.status)).reduce((n, b) => n + b.party_size, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" subtitle={bookings ? `${plural(bookings.length, 'booking')}, ${plural(guests, 'guest')} expected` : ' '} />

      <div className="flex flex-wrap items-end gap-2">
        <Button size="sm" variant="outline" onClick={() => setDate(shiftDay(date, -1))}>Previous day</Button>
        <TextField className="w-48" label="Day" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <Button size="sm" variant="outline" onClick={() => setDate(shiftDay(date, 1))}>Next day</Button>
        <Button size="sm" variant="outline" onClick={() => setDate(isoDay(new Date()))}>Today</Button>
      </div>

      {error && <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">{error}</p>}

      {bookings === null ? (
        <p className="text-muted">Loading bookings…</p>
      ) : (
        <div className="space-y-3">
          {starts.map((start) => {
            const slot = slots.find((s) => s.start === start);
            const inSlot = bookings.filter((b) => b.slot_start.startsWith(start));
            return (
              <section key={start} aria-labelledby={`slot-${start}`} className="rounded-lg bg-panel p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id={`slot-${start}`} className="m-0 font-display text-xl font-extrabold text-olive-dark">{start}</h2>
                  {slot && (
                    <span className={`text-sm font-bold ${slot.remaining === 0 ? 'text-danger' : 'text-muted'}`}>
                      {slot.booked} of {slot.capacity} booked{slot.remaining === 0 ? ' · Full' : ''}
                    </span>
                  )}
                </div>
                {slot && (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream" aria-hidden="true">
                    <div className="h-full bg-olive-strong" style={{ width: `${Math.min(100, (slot.booked / slot.capacity) * 100)}%` }} />
                  </div>
                )}
                {inSlot.length > 0 && (
                  <ul className="m-0 mt-3 list-none space-y-2 p-0">
                    {inSlot.map((b) => (
                      <li key={b.id} className={`flex flex-wrap items-center gap-3 rounded-md bg-cream px-3 py-2 ${['cancelled', 'no_show'].includes(b.status) ? 'opacity-70' : ''}`}>
                        <div className="min-w-0 flex-1">
                          <p className="m-0 font-bold">
                            {b.name} · {plural(b.party_size, 'guest')}
                            {b.kids_count > 0 && <span className="font-medium text-muted"> ({plural(b.kids_count, 'child', 'children')})</span>}
                          </p>
                          <p className="m-0 text-sm text-muted">
                            <a href={`tel:${b.phone}`}>{b.phone}</a>{b.email && ` · ${b.email}`}
                          </p>
                          {b.notes && <p className="m-0 text-sm">{b.notes}</p>}
                        </div>
                        <Chip tone={b.status === 'arrived' || b.status === 'confirmed' ? 'veg' : 'neutral'}>{STATUS_LABEL[b.status]}</Chip>
                        <div className="flex flex-wrap gap-2">
                          {ACTIONS[b.status].map(([to, label]) => (
                            <Button key={to} size="sm" variant={to === 'cancelled' || to === 'no_show' ? 'outline' : 'primary'} onClick={() => setStatus(b, to)}>
                              {label}
                            </Button>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
          {starts.length === 0 && <p className="text-muted">No slots on this day.</p>}
        </div>
      )}
    </div>
  );
}
