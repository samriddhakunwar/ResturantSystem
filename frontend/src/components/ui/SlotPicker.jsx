// ─── Slot Picker ──────────────────────────────────────────────────────────────
// Time-slot pills for "Book a visit" (ui-kit/components/SlotPicker.md). Full
// slots stay visible but disabled; slots without room for the party
// (`needed`) are disabled too. Only one slot can be chosen.
import { plural } from '../../lib/format';

export default function SlotPicker({ slots, value, onChange, needed = 1, label = 'Time slots' }) {
  return (
    <div className="wb-slots" role="group" aria-label={label}>
      {slots.map((s) => {
        const full = s.remaining <= 0;
        const tooSmall = !full && s.remaining < needed;
        return (
          <button
            key={s.start}
            type="button"
            className="wb-slot"
            aria-pressed={value === s.start}
            disabled={full || tooSmall}
            onClick={() => onChange(s.start)}
          >
            {s.start}
            <small>{full ? 'Full' : plural(s.remaining, 'spot')}</small>
          </button>
        );
      })}
    </div>
  );
}
