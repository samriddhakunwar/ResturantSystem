// ─── Category Filter Pills ────────────────────────────────────────────────────

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
                ? 'bg-olive-strong text-cream border-olive-strong shadow-sm'
                : 'bg-panel text-muted border-line hover:border-olive-strong hover:text-olive-dark hover:bg-olive-soft'
              }
            `}
          >
            {cat}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-panel text-cream' : 'bg-cream-pressed text-muted'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
