// ─── New Order Page ────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { Search, X, ShoppingCart, User, Hash, StickyNote } from 'lucide-react';
import { usePOS } from '../context/PosContext';
import PosMenuCard from '../components/pos/PosMenuCard';
import PosCategoryFilter from '../components/pos/PosCategoryFilter';
import PosOrderPanel from '../components/pos/PosOrderPanel';
import CatSilhouette from '../components/decor/CatSilhouette';

export default function NewOrder() {
  const {
    cartCustomer, setCartCustomer,
    cartTable,    setCartTable,
    cartNotes,    setCartNotes,
    cartCount,    cartDrawerOpen, setCartDrawerOpen,
    menuItems,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery]           = useState('');

  // Only sellable items appear on the POS grid.
  const sellable = useMemo(
    () => menuItems.filter((i) => i.available !== false),
    [menuItems],
  );

  // Category pills derived from the live menu (so they match the backend).
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(sellable.map((i) => i.category)))],
    [sellable],
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: sellable.length };
    categories.slice(1).forEach((cat) => {
      counts[cat] = sellable.filter((i) => i.category === cat).length;
    });
    return counts;
  }, [sellable, categories]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return sellable.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch   = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [sellable, selectedCategory, searchQuery]);

  return (
    // Full-bleed POS layout: override parent padding by negative margin
    <div className="flex h-full overflow-hidden bg-[#f4f5f7]">

      {/* ──────────────────── CENTER: Menu Section ──────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3 shrink-0">
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">New Order</h1>
            <p className="text-xs text-gray-400">Build & manage order for customer</p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for items…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-olive-strong focus:bg-white focus:ring-2 focus:ring-olive-soft transition-all placeholder:text-gray-400"
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
          </div>

          {/* Mobile cart toggle */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative xl:hidden ml-auto flex items-center gap-2 px-3 py-2 bg-olive-strong text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-olive-dark transition-colors active:scale-95"
          >
            <ShoppingCart size={16} />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-olive-strong border-2 border-olive-strong rounded-full text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Order Form */}
        <div className="px-5 py-3 bg-white border-b border-gray-100 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Customer name or phone…"
                value={cartCustomer}
                onChange={(e) => setCartCustomer(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-olive-strong focus:bg-white focus:ring-2 focus:ring-olive-soft transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Table number…"
                value={cartTable}
                onChange={(e) => setCartTable(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-olive-strong focus:bg-white focus:ring-2 focus:ring-olive-soft transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <StickyNote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Kitchen notes (optional)…"
                value={cartNotes}
                onChange={(e) => setCartNotes(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-olive-strong focus:bg-white focus:ring-2 focus:ring-olive-soft transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-5 py-2.5 bg-white border-b border-gray-100 shrink-0">
          <PosCategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
            counts={categoryCounts}
          />
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <CatSilhouette pose="stretching" className="mb-3 h-14 w-auto" />
              <p className="text-sm font-semibold text-gray-600">No items found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search or category</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-3 text-xs text-olive-strong font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                  {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                  {searchQuery ? ` matching "${searchQuery}"` : ''}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {filteredItems.map((item) => (
                  <PosMenuCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ──────────────────── RIGHT: Order Panel (desktop) ──────────────────── */}
      <div className="hidden xl:flex w-80 2xl:w-96 shrink-0">
        <PosOrderPanel className="w-full" />
      </div>

      {/* ──────────────────── Mobile Cart Drawer ──────────────────── */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setCartDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 bg-white shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={16} className="text-olive-strong" />
                Order Cart
              </span>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <PosOrderPanel className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
