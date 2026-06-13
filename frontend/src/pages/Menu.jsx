// ─── Menu Management Page ─────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { Search, X, LayoutGrid, List, Package, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { usePOS } from '../context/PosContext';
import { CATEGORY_META } from '../data/menuManagementData';
import MenuCategoryCard from '../components/menu/MenuCategoryCard';
import AddMenuItemForm from '../components/menu/AddMenuItemForm';

const FILTER_TABS = [
  { id: 'all',       label: 'All Items' },
  { id: 'active',    label: 'Active' },
  { id: 'inactive',  label: 'Inactive' },
];

export default function Menu() {
  const { menuItems } = usePOS();

  const [searchQuery, setSearchQuery]       = useState('');
  const [activeFilter, setActiveFilter]     = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddPanel, setShowAddPanel]     = useState(true);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalItems    = menuItems.length;
  const activeItems   = menuItems.filter((i) => i.available).length;
  const inactiveItems = totalItems - activeItems;

  // Category list derived from the live menu (matches whatever the backend has).
  const allCategories = useMemo(
    () => Array.from(new Set(menuItems.map((i) => i.category))),
    [menuItems],
  );

  // ── Filtered items ────────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch   = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchFilter   =
        activeFilter === 'all'      ? true :
        activeFilter === 'active'   ? item.available :
        activeFilter === 'inactive' ? !item.available : true;
      return matchSearch && matchCategory && matchFilter;
    });
  }, [menuItems, searchQuery, selectedCategory, activeFilter]);

  // ── Group by category ─────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const cats = selectedCategory === 'All' ? allCategories : [selectedCategory];
    return cats.map((cat) => ({
      category: cat,
      items: filteredItems.filter((i) => i.category === cat),
    })).filter((g) => g.items.length > 0 || selectedCategory !== 'All');
  }, [filteredItems, selectedCategory, allCategories]);

  const totalFiltered = filteredItems.length;

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage items, prices and availability</p>
        </div>
        <button
          onClick={() => setShowAddPanel((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border active:scale-95
            ${showAddPanel
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200'
              : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
            }`}
        >
          <Package size={15} />
          {showAddPanel ? 'Hide Add Panel' : '+ Add Item'}
        </button>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Items',    value: totalItems,    icon: Package,   color: 'text-gray-900',   bg: 'bg-gray-100' },
          { label: 'Active Items',   value: activeItems,   icon: Eye,       color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Inactive Items', value: inactiveItems, icon: EyeOff,    color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} shrink-0`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} size={18} />
            </div>
            <div>
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────────── */}
      <div className={`grid gap-5 ${showAddPanel ? 'xl:grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>

        {/* ── LEFT: Menu List ─────────────────────────────────────────────── */}
        <div className="min-w-0 space-y-4">

          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none
                  focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {['All', ...allCategories].map((cat) => {
                const meta = CATEGORY_META[cat];
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0
                      ${isActive
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-200 hover:text-orange-600'
                      }`}
                  >
                    {meta?.emoji || '🍽️'} {cat}
                  </button>
                );
              })}
            </div>

            {/* Status filter */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5 shrink-0">
              {FILTER_TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                    ${activeFilter === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-gray-500 font-medium">
              {totalFiltered === 0
                ? 'No items found'
                : `${totalFiltered} item${totalFiltered !== 1 ? 's' : ''}${searchQuery ? ` matching "${searchQuery}"` : ''}`
              }
            </p>
            {(searchQuery || selectedCategory !== 'All' || activeFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setActiveFilter('all'); }}
                className="text-xs text-orange-500 font-semibold hover:text-orange-600 flex items-center gap-1"
              >
                <X size={12} /> Clear filters
              </button>
            )}
          </div>

          {/* Category cards */}
          {totalFiltered === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-base font-bold text-gray-700 mb-1">No items found</p>
              <p className="text-sm text-gray-400">Try a different search or filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map(({ category, items }) => (
                <MenuCategoryCard key={category} category={category} items={items} />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Add Item Panel ────────────────────────────────────────── */}
        {showAddPanel && (
          <div className="xl:sticky xl:top-0 xl:self-start xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto scrollbar-hide">
            <AddMenuItemForm />
          </div>
        )}
      </div>
    </div>
  );
}
