// ─── POS Menu Card ────────────────────────────────────────────────────────────
import { Plus, Minus } from 'lucide-react';
import { usePOS } from '../../context/PosContext';

const BADGE_COLORS = {
  orange: 'bg-orange-100 text-orange-700',
  red:    'bg-red-100 text-red-700',
  green:  'bg-green-100 text-green-700',
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

export default function PosMenuCard({ item }) {
  const { addToCart, incrementQty, decrementQty, getItemQty } = usePOS();
  const qty = getItemQty(item.id);
  const inCart = qty > 0;

  return (
    <div
      className={`
        relative bg-white rounded-2xl border shadow-sm overflow-hidden
        flex flex-col cursor-pointer select-none
        transition-all duration-200 ease-in-out
        hover:shadow-md hover:-translate-y-0.5 hover:border-orange-200
        active:scale-[0.98]
        ${inCart ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100'}
      `}
      onClick={() => addToCart(item)}
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl">${item.emoji}</div>`;
          }}
        />
        {/* Badge */}
        {item.badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[item.badgeColor] || 'bg-gray-100 text-gray-600'}`}>
            {item.badge}
          </span>
        )}
        {/* In-cart indicator */}
        {inCart && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-[10px] font-bold">{qty}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 flex-1">{item.description}</p>

        {/* Price + quantity controls */}
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-base font-bold text-orange-500">Rs {item.price.toFixed(2)}</span>

          {inCart ? (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => decrementQty(item.id)}
                className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition-colors active:scale-95"
              >
                <Minus size={11} strokeWidth={3} />
              </button>
              <span className="w-5 text-center text-sm font-bold text-gray-800">{qty}</span>
              <button
                onClick={() => incrementQty(item.id)}
                className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors active:scale-95"
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm active:scale-95"
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
