// ─── Cart Sheet ───────────────────────────────────────────────────────────────
// Bottom sheet opened from the CartBar: a cream panel with radius-lg top
// corners and shadow-sheet (ui-kit/components/CartBar.md). Native <dialog>
// gives us the focus trap, Esc to close and an inert page behind it.
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import QuantityStepper from '../../components/ui/QuantityStepper';
import TextField from '../../components/ui/TextField';
import CatSilhouette from '../../components/decor/CatSilhouette';
import { estimateCharges, formatRs } from '../../lib/format';

function CartLine({ line, item, onQty, onNote }) {
  const [noteOpen, setNoteOpen] = useState(Boolean(line.note));
  return (
    <li className="border-b border-line py-3 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 font-bold leading-6">{item.name}</p>
          <p className="m-0 text-sm text-muted tabular-nums">{formatRs(item.price)} each</p>
        </div>
        <QuantityStepper value={line.qty} onChange={onQty} label={`Quantity of ${item.name}`} removable />
      </div>
      {noteOpen ? (
        <TextField
          className="mt-3"
          label={`Note for ${item.name}`}
          placeholder="Less sugar, please"
          maxLength={200}
          value={line.note}
          onChange={(e) => onNote(e.target.value)}
        />
      ) : (
        <button
          type="button"
          className="mt-1 border-0 bg-transparent p-0 text-sm font-bold text-olive-strong underline"
          onClick={() => setNoteOpen(true)}
        >
          Add a note
        </button>
      )}
    </li>
  );
}

export default function CartSheet({ open, onClose, tableLabel, cart, itemsById, onQty, onNote, onNotes, onSend, sending, error }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const lines = cart.lines.filter((l) => itemsById[l.id]);
  const subtotal = lines.reduce((sum, l) => sum + itemsById[l.id].price * l.qty, 0);
  const charges = estimateCharges(subtotal);

  return (
    <dialog
      ref={ref}
      aria-labelledby="cart-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="mb-0 mt-auto w-full max-w-[480px] rounded-t-lg border-0 bg-cream p-0 text-charcoal shadow-sheet backdrop:bg-[rgba(68,64,52,0.45)]"
      style={{ maxHeight: '88dvh' }}
    >
      <div className="flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div>
            <h2 id="cart-title" className="m-0 font-display text-2xl font-extrabold text-olive-dark">Your order</h2>
            {tableLabel && <p className="m-0 text-sm text-muted">We&rsquo;ll bring it to {tableLabel}.</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="grid h-11 w-11 place-items-center rounded-full border-0 bg-panel text-olive-dark"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-col items-center px-4 pb-8 pt-4 text-center">
            <CatSilhouette pose="lying" className="mb-4 h-20 w-auto" />
            <p className="m-0 font-display text-xl font-extrabold text-olive-dark">Your cart is having a nap</p>
            <p className="m-0 mt-1 text-sm text-muted">Tap + on anything you fancy.</p>
            <Button variant="outline" className="mt-5" onClick={onClose}>Back to the menu</Button>
          </div>
        ) : (
          <>
            <ul className="m-0 list-none overflow-y-auto px-4 py-0">
              {lines.map((line) => (
                <CartLine
                  key={line.id}
                  line={line}
                  item={itemsById[line.id]}
                  onQty={(qty) => onQty(line.id, qty)}
                  onNote={(note) => onNote(line.id, note)}
                />
              ))}
            </ul>
            <div className="space-y-3 px-4 pb-4 pt-2">
              <TextField
                label="Note for the kitchen"
                placeholder="We're celebrating a birthday"
                multiline
                maxLength={500}
                value={cart.notes}
                onChange={(e) => onNotes(e.target.value)}
              />
              <dl className="m-0 space-y-1 text-sm tabular-nums">
                <div className="flex justify-between"><dt>Subtotal</dt><dd className="m-0">{formatRs(subtotal)}</dd></div>
                <div className="flex justify-between text-muted"><dt>Service charge (10%)</dt><dd className="m-0">{formatRs(charges.service)}</dd></div>
                <div className="flex justify-between text-muted"><dt>VAT (13%)</dt><dd className="m-0">{formatRs(charges.vat)}</dd></div>
                <div className="flex justify-between pt-1 text-base font-bold"><dt>Total</dt><dd className="m-0 text-olive-strong">{formatRs(charges.total)}</dd></div>
              </dl>
              <p className="m-0 text-xs text-muted">Totals include 10% service charge and 13% VAT. Staff confirm your order before the kitchen starts.</p>
              <div aria-live="assertive">
                {error && <p className="wb-field-error m-0">{error}</p>}
              </div>
              <Button block onClick={onSend} disabled={sending}>
                {sending ? 'Sending…' : 'Send to kitchen'}
              </Button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
