// ─── Stat Card ────────────────────────────────────────────────────────────────
import {
  Banknote, ShoppingBag, Clock, TrendingUp,
  TrendingDown, QrCode, CalendarDays, Cat,
} from 'lucide-react';

const iconMap = {
  DollarSign: Banknote, ShoppingBag, Clock, TrendingUp, QrCode, CalendarDays, Cat,
};

export default function StatCard({ title, value, growth, trend, hint, bg = 'bg-olive-soft', iconColor = 'text-olive-strong', icon }) {
  const Icon = iconMap[icon] ?? Banknote;
  const isUp = trend === 'up';

  return (
    <div className="bg-panel rounded-2xl border border-line shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
        </div>
        {growth && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
              ${isUp ? 'bg-olive-soft text-olive-strong' : 'bg-danger-soft text-danger'}`}
          >
            {isUp ? <TrendingUp className="w-3 h-3" aria-hidden="true" /> : <TrendingDown className="w-3 h-3" aria-hidden="true" />}
            {growth}
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-extrabold text-charcoal mb-0.5 tabular-nums">{value}</p>
      <p className="text-sm text-muted">{title}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}
