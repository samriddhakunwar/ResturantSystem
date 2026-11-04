// ─── POS Menu Card ────────────────────────────────────────────────────────────
import { Plus, Minus } from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import ItemThumb from '../ui/ItemThumb';
import Chip from '../ui/Chip';
import { formatRs } from '../../lib/format';

export default function PosMenuCard({ item }) {
  const { addToCart, incrementQty, decrementQty, getItemQty } = usePOS();
  const qty = getItemQty(item.id);
  const inCart = qty > 0;

  return (
    <div
      className={`
        relative bg-panel rounded-2xl border shadow-sm overflow-hidden
        flex flex-col cursor-pointer select-none
        transition-all duration-200 ease-in-out
        hover:shadow-md hover:-translate-y-0.5 hover:border-olive-strong
        active:scale-[0.98]
        ${inCart ? 'border-olive ring-2 ring-olive-soft' : 'border-line'}
      `}
      onClick={() => addToCart(item)}
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden bg-cream-pressed">
        <ItemThumb item={item} className="h-full w-full !rounded-none" />
        {item.recommendedBy && (
          <Chip tone="pick" className="absolute top-2 left-2">{item.recommendedBy}&rsquo;s pick</Chip>
        )}
        {/* In-cart indicator */}
        {inCart && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-olive-strong rounded-full flex items-center justify-center shadow-md">
            <span className="text-cream text-[10px] font-bold">{qty}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-semibold text-charcoal leading-tight line-clamp-1">{item.name}</p>
        <p className="text-xs text-muted mt-0.5 line-clamp-1 flex-1">{item.description}</p>

        {/* Price + quantity controls */}
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-base font-bold text-olive-strong">{formatRs(item.price)}</span>

          {inCart ? (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => decrementQty(item.id)}
                className="w-6 h-6 rounded-lg bg-olive-soft text-olive-strong flex items-center justify-center hover:bg-olive-soft transition-colors active:scale-95"
              >
                <Minus size={11} strokeWidth={3} />
              </button>
              <span className="w-5 text-center text-sm font-bold text-charcoal">{qty}</span>
              <button
                onClick={() => incrementQty(item.id)}
                className="w-6 h-6 rounded-lg bg-olive-strong text-cream flex items-center justify-center hover:bg-olive-dark transition-colors active:scale-95"
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              className="w-7 h-7 rounded-lg bg-olive-strong text-cream flex items-center justify-center hover:bg-olive-dark transition-colors shadow-sm active:scale-95"
              onClick={(e) => { e.stopPropagation(); addToCart(item); }}
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
