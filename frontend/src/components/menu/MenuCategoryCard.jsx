// ─── Menu Category Card ───────────────────────────────────────────────────────
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import MenuItemRow from './MenuItemRow';
import { CATEGORY_META } from '../../data/menuManagementData';

export default function MenuCategoryCard({ category, items }) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = CATEGORY_META[category] || { emoji: '🍽️', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };

  const activeCount = items.filter((i) => i.available).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/70 transition-colors group"
      >
        {/* Emoji + name */}
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0 ${meta.bg}`}>
          {meta.emoji}
        </span>
        <div className="flex-1 text-left">
          <p className={`text-sm font-bold ${meta.text}`}>{category}</p>
          <p className="text-xs text-gray-400">
            {activeCount} active · {items.length - activeCount} inactive · {items.length} total
          </p>
        </div>

        {/* Item count badge */}
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${meta.bg} ${meta.text}`}>
          {items.length} items
        </span>

        {/* Collapse toggle */}
        <span className="text-gray-400 group-hover:text-gray-600 transition-colors ml-1">
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </span>
      </button>

      {/* Column headers */}
      {!collapsed && (
        <>
          <div className="px-5 pb-1 flex items-center gap-3 border-t border-gray-50">
            <div className="w-4" />
            <div className="w-11 shrink-0" />
            <p className="flex-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 pl-1">Item</p>
            <p className="hidden sm:block text-[10px] font-bold text-gray-400 uppercase tracking-wider w-16 text-center shrink-0">Category</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-24 text-center shrink-0">Price</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-11 text-center shrink-0">Status</p>
            <p className="hidden lg:block text-[10px] font-bold text-gray-400 uppercase tracking-wider w-16 text-center shrink-0" />
            <div className="w-8 shrink-0" />
          </div>

          {/* Items */}
          <div className="px-4 pb-4 space-y-1.5">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">{meta.emoji}</p>
                <p className="text-sm font-medium">No items in this category</p>
              </div>
            ) : (
              items.map((item) => (
                <MenuItemRow key={item.id} item={item} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
