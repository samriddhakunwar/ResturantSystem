// ─── Paw Trail ────────────────────────────────────────────────────────────────
// Five olive prints walking up and to the right, at 35% opacity, for page
// corners. Pure decoration.
import { PAWS } from './assets';

export default function PawTrail({ className = '', style }) {
  return (
    <img
      src={PAWS['paw-trail']}
      alt=""
      aria-hidden="true"
      draggable="false"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity: 0.35, ...style }}
    />
  );
}
