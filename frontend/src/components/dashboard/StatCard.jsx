// ─── Stat Card ────────────────────────────────────────────────────────────────
import {
  DollarSign, ShoppingBag, Clock, TrendingUp,
  TrendingDown,
} from 'lucide-react';

const iconMap = {
  DollarSign, ShoppingBag, Clock, TrendingUp,
};

export default function StatCard({ title, value, growth, trend, bg, iconColor, icon }) {
  const Icon = iconMap[icon] ?? DollarSign;
  const isUp = trend === 'up';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
            ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}
        >
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {growth}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}
