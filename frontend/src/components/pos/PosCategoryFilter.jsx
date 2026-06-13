// ─── Category Filter Pills ────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  All:      '🍽️',
  Pizza:    '🍕',
  Sides:    '🍟',
  Drinks:   '🥤',
  Desserts: '🍫',
};

export default function PosCategoryFilter({ categories, selected, onChange, counts }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => {
        const isActive = selected === cat;
        const count    = counts?.[cat] ?? 0;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold
              whitespace-nowrap shrink-0 transition-all duration-150 border
              ${isActive
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
              }
            `}
          >
            <span className="text-base leading-none">{CATEGORY_ICONS[cat]}</span>
            {cat}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
