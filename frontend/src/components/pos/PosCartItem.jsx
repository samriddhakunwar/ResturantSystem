// ─── POS Cart Item Row ────────────────────────────────────────────────────────
import { Trash2, Plus, Minus } from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import ItemThumb from '../ui/ItemThumb';

export default function PosCartItem({ item }) {
  const { incrementQty, decrementQty, removeFromCart } = usePOS();
  const subtotal = (item.price * item.qty).toFixed(2);

  return (
    <div className="flex items-center gap-2.5 py-3 border-b border-gray-50 last:border-0 group animate-[fadeIn_0.2s_ease]">
      {/* Photo or category doodle */}
      <ItemThumb item={item} className="h-10 w-10" />

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
        <p className="text-xs text-gray-400">Rs {item.price.toFixed(2)} each</p>
      </div>

      {/* Qty stepper */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => decrementQty(item.id)}
          className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-olive-soft hover:text-olive-dark transition-colors active:scale-95"
        >
          <Minus size={10} strokeWidth={3} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-gray-800">{item.qty}</span>
        <button
          onClick={() => incrementQty(item.id)}
          className="w-6 h-6 rounded-lg bg-olive-strong text-white flex items-center justify-center hover:bg-olive-dark transition-colors active:scale-95"
        >
          <Plus size={10} strokeWidth={3} />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right shrink-0 w-14">
        <p className="text-sm font-bold text-gray-900">${subtotal}</p>
      </div>

      {/* Delete */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="w-6 h-6 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors active:scale-95 opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
