// ─── Category Tabs ────────────────────────────────────────────────────────────
// Sticky, sideways-scrolling menu-section tabs (ui-kit/components/CategoryTabs.md).
// The parent tracks which section is in view and passes it as `activeId`;
// tapping a tab calls `onSelect(id)` so the parent can scroll to that section.
import { useEffect, useRef } from 'react';

export default function CategoryTabs({ categories, activeId, onSelect, label = 'Menu sections', className = '' }) {
  const listRef = useRef(null);

  // Keep the selected tab visible as the guest scrolls the menu.
  useEffect(() => {
    const tab = listRef.current?.querySelector('[aria-selected="true"]');
    tab?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeId]);

  return (
    <div ref={listRef} className={`wb-tabs sticky top-0 z-20 ${className}`} role="tablist" aria-label={label}>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          className="wb-tab"
          aria-selected={c.id === activeId}
          aria-controls={`section-${c.id}`}
          onClick={() => onSelect?.(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
