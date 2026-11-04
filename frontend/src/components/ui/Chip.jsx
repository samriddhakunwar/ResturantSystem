// ─── Chip & ChipToggle ───────────────────────────────────────────────────────
// Small pill labels for dietary tags and status (ui-kit/components/Chip.md).
//   tone: veg (check icon) | neutral | allergen (warning icon) | new | pick
// ChipToggle is the 36px filter button with aria-pressed.
// The meaning is always in the word, never in the colour alone.
import { Check, TriangleAlert } from 'lucide-react';

const TONE_CLASS = {
  veg: 'wb-chip--veg',
  neutral: '',
  allergen: 'wb-chip--allergen',
  new: 'wb-chip--new',
  pick: 'wb-chip--pick',
};

export default function Chip({ tone = 'neutral', className = '', children, ...rest }) {
  return (
    <span className={`wb-chip ${TONE_CLASS[tone] ?? ''} ${className}`} {...rest}>
      {tone === 'veg' && <Check aria-hidden="true" strokeWidth={3} />}
      {tone === 'allergen' && <TriangleAlert aria-hidden="true" strokeWidth={2.5} />}
      {children}
    </span>
  );
}

export function ChipToggle({ pressed = false, onChange, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      className={`wb-chip wb-chip-toggle ${className}`}
      aria-pressed={pressed}
      onClick={() => onChange?.(!pressed)}
      {...rest}
    >
      {children}
    </button>
  );
}
