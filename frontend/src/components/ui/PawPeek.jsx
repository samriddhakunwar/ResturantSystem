// ─── Paw Peek ─────────────────────────────────────────────────────────────────
// A coloured paw reaching in from the right edge (ui-kit/components/PawPeek.md).
// Landing, empty-state and booking-confirmation screens only — never the menu,
// the cart or staff screens. Place inside a `position: relative` container.
import { PAWS } from '../decor/assets';

export default function PawPeek({ color = 'ginger', top = 0, className = '' }) {
  return (
    <img
      src={PAWS[`paw-peek-${color}`]}
      alt=""
      aria-hidden="true"
      draggable="false"
      className={`wb-pawpeek ${className}`}
      style={{ top }}
    />
  );
}
