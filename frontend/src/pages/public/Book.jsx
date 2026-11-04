// ─── Book a Visit ─────────────────────────────────────────────────────────────
// /book — pick a day and slot, say how many are coming (kids count in the
// party), accept the cat rules, leave a name and phone. Capacity is checked
// again on the server, so a slot that fills meanwhile gets a clear message.
import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import QuantityStepper from '../../components/ui/QuantityStepper';
import SectionPanel from '../../components/ui/SectionPanel';
import SlotPicker from '../../components/ui/SlotPicker';
import TextField, { Checkbox } from '../../components/ui/TextField';
import CatSilhouette from '../../components/decor/CatSilhouette';
import PawPeek from '../../components/ui/PawPeek';
import { fieldErrors, publicApi } from '../../api/public';
import { useCafeConfig } from '../../context/CafeConfigContext';
import { plural } from '../../lib/format';

const RULES = [
  'Let the cats come to you, and never pick them up.',
  'No feeding the cats, not even a crumb.',
  'Children under 12 stay with an adult.',
  'Sleeping cats are not to be woken.',
];

/** YYYY-MM-DD in the guest's local time (toISOString would use UTC). */
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const prettyDay = (iso) =>
  new Date(`${iso}T00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Book() {
  const config = useCafeConfig();
  const maxGuests = config.booking?.max_guests_per_slot ?? 12;
  const today = isoDay(new Date());
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState(null);
  const [slot, setSlot] = useState('');
  const [party, setParty] = useState(2);
  const [kids, setKids] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [rules, setRules] = useState(false);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setSlots(null);
    publicApi
      .slots(date)
      .then((r) => !cancelled && setSlots(r.slots))
      .catch(() => !cancelled && setSlots([]));
    return () => {
      cancelled = true;
    };
  }, [date]);

  // A different day or a bigger party can make the chosen slot unavailable.
  const chosen = slots?.find((s) => s.start === slot);
  const slotValue = chosen && chosen.remaining >= party ? slot : '';

  const field = (key) => ({
    value: form[key],
    error: errors[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const submit = async (e) => {
    e.preventDefault();
    const local = {};
    if (!slotValue) local.slot_start = 'Please pick a time.';
    if (!rules) local.accepted_rules = 'Please accept the café rules to book.';
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    setSending(true);
    setErrors({});
    try {
      await publicApi.book({
        ...form,
        date,
        slot_start: slotValue,
        party_size: party,
        kids_count: kids,
        accepted_rules: true,
      });
      setBooked({ date, slot: slotValue, party, name: form.name });
    } catch (err) {
      setErrors(fieldErrors(err));
      if (fieldErrors(err).slot_start) publicApi.slots(date).then((r) => setSlots(r.slots)).catch(() => {});
    } finally {
      setSending(false);
    }
  };

  if (booked) {
    return (
      <div className="relative mx-auto max-w-[480px] overflow-x-clip px-4 pb-10 pt-10 text-center">
        <PawPeek color="ginger" top={40} />
        <PawPeek color="calico" top={260} className="!left-0 !right-auto -scale-x-100" />
        <CatSilhouette pose="pouncing" className="mx-auto mb-6 h-28 w-auto" />
        <h1 className="m-0 font-display text-[32px] font-extrabold leading-10 text-olive-dark">You&rsquo;re booked in</h1>
        <p className="m-0 mt-3 text-lg">
          {prettyDay(booked.date)} at {booked.slot}, {plural(booked.party, 'guest')}.
        </p>
        <p className="m-0 mt-2 text-muted">See you soon, {booked.name}. The cats will pretend not to notice.</p>
        <div className="mt-8 flex flex-col gap-3">
          <Button to="/cats">Meet the cats</Button>
          <Button variant="outline" to="/">Back home</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-[560px] space-y-6 px-4 pb-6 pt-2">
      <div>
        <h1 className="m-0 font-display text-[32px] font-extrabold leading-10 text-charcoal">Book a visit</h1>
        <p className="m-0 mt-1 text-muted">
          Each visit is {config.booking?.slot_minutes ?? 60} minutes with the cats. Walk-ins are welcome when there&rsquo;s room.
        </p>
      </div>

      <TextField label="Day" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required />

      <div className="flex flex-wrap gap-6">
        <div>
          <p className="m-0 mb-2 font-bold" id="party-label">Guests</p>
          <QuantityStepper value={party} onChange={(v) => { setParty(v); setKids((k) => Math.min(k, v)); }} min={1} max={maxGuests} label="Number of guests" />
        </div>
        <div>
          <p className="m-0 mb-2 font-bold">Of which children</p>
          <QuantityStepper value={kids} onChange={setKids} min={0} max={party} label="Number of children" />
        </div>
      </div>
      {errors.party_size && <p className="wb-field-error m-0">{errors.party_size}</p>}
      {errors.kids_count && <p className="wb-field-error m-0">{errors.kids_count}</p>}

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 p-0 font-bold">Time</legend>
        {slots === null ? (
          <p className="m-0 text-muted">Checking which slots are free…</p>
        ) : slots.length === 0 ? (
          <p className="m-0 text-muted">No slots on this day. Please try another.</p>
        ) : (
          <SlotPicker slots={slots} value={slotValue} onChange={setSlot} needed={party} />
        )}
        {errors.slot_start && <p className="wb-field-error m-0 mt-2">{errors.slot_start}</p>}
      </fieldset>

      <SectionPanel title="The cat rules">
        <ul className="m-0 mb-4 space-y-1 pl-5 text-left">
          {RULES.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <Checkbox checked={rules} onChange={(e) => setRules(e.target.checked)} error={errors.accepted_rules} className="text-left">
          I&rsquo;ve read the rules and will share them with my group.
        </Checkbox>
      </SectionPanel>

      <TextField label="Your name" autoComplete="name" required maxLength={100} {...field('name')} />
      <TextField label="Phone" type="tel" autoComplete="tel" required maxLength={20} {...field('phone')} />
      <TextField label="Email" type="email" autoComplete="email" help="Optional, for a reminder" {...field('email')} />
      <TextField label="Anything we should know?" multiline maxLength={500} {...field('notes')} />

      <div aria-live="assertive">{errors._form && <p className="wb-field-error m-0">{errors._form}</p>}</div>
      <Button type="submit" block disabled={sending}>{sending ? 'Booking…' : 'Book my visit'}</Button>
    </form>
  );
}
