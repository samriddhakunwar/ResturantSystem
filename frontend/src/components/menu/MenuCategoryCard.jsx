// ─── Menu Category Card ───────────────────────────────────────────────────────
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import MenuItemRow from './MenuItemRow';
import { doodleFor } from '../../data/menuManagementData';
import Doodle from '../decor/Doodle';

export default function MenuCategoryCard({ category, items }) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = { bg: 'bg-olive-soft', text: 'text-olive-dark' };

  const activeCount = items.filter((i) => i.available).length;

  return (
    <div className="bg-panel rounded-2xl border border-line shadow-sm overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-cream transition-colors group"
      >
        {/* Emoji + name */}
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
          <Doodle name={doodleFor(category)} className="h-6 w-6" />
        </span>
        <div className="flex-1 text-left">
          <p className={`text-sm font-bold ${meta.text}`}>{category}</p>
          <p className="text-xs text-muted">
            {activeCount} active · {items.length - activeCount} inactive · {items.length} total
          </p>
        </div>

        {/* Item count badge */}
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${meta.bg} ${meta.text}`}>
          {items.length} items
        </span>

        {/* Collapse toggle */}
        <span className="text-muted group-hover:text-muted transition-colors ml-1">
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </span>
      </button>

      {/* Column headers */}
      {!collapsed && (
        <>
          <div className="px-5 pb-1 flex items-center gap-3 border-t border-line">
            <div className="w-4" />
            <div className="w-11 shrink-0" />
            <p className="flex-1 text-[10px] font-bold text-muted uppercase tracking-wider ml-1 pl-1">Item</p>
            <p className="hidden sm:block text-[10px] font-bold text-muted uppercase tracking-wider w-16 text-center shrink-0">Category</p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider w-24 text-center shrink-0">Price</p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider w-11 text-center shrink-0">Status</p>
            <p className="hidden lg:block text-[10px] font-bold text-muted uppercase tracking-wider w-16 text-center shrink-0" />
            <div className="w-8 shrink-0" />
          </div>

          {/* Items */}
          <div className="px-4 pb-4 space-y-1.5">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <Doodle name={doodleFor(category)} className="mx-auto mb-2 h-8 w-8" />
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
