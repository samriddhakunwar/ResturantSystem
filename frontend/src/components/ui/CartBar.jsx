// ─── Cart Bar ─────────────────────────────────────────────────────────────────
// Floating pill pinned to the bottom of the QR menu (ui-kit/components/CartBar.md).
// Shown only when the cart has items; 16px above the bottom safe area.
// Set `floating={false}` to render it in place (style guide).
import { formatRs, plural } from '../../lib/format';

export default function CartBar({ count, total, onOpen, floating = true, label = 'View cart' }) {
  if (!count) return null;
  const bar = (
    <button type="button" className="wb-cartbar" onClick={onOpen} aria-haspopup="dialog">
      <span className="wb-cartbar-count tabular-nums">
        {plural(count, 'item')} · {formatRs(total)}
      </span>
      <span className="wb-cartbar-cta">{label}</span>
    </button>
  );
  if (!floating) return bar;
  return (
    <div
      className="fixed inset-x-0 z-30 mx-auto max-w-[480px] px-4"
      style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))' }}
    >
      {bar}
    </div>
  );
}
