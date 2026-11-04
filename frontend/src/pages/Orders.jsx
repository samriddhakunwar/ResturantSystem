// ─── Orders Page ──────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import PageHeader from '../components/ui/PageHeader';
import SearchBar from '../components/ui/SearchBar';
import OrderCard from '../components/orders/OrderCard';
import Button from '../components/ui/Button';
import { usePOS } from '../context/PosContext';
import { PlusCircle, RefreshCw } from 'lucide-react';
import CatSilhouette from '../components/decor/CatSilhouette';

const TABS = ['All', 'Pending', 'Preparing', 'Completed', 'Cancelled'];

const tabCount = (orders, tab) =>
  tab === 'All' ? orders.length : orders.filter((o) => o.status === tab).length;

export default function Orders() {
  const { orders } = usePOS();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = orders;
    if (activeTab !== 'All') result = result.filter((o) => o.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.table.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, activeTab, search]);

  const tabColors = {
    Pending:   'text-ginger-ink bg-ginger-soft',
    Preparing: 'text-olive-strong bg-olive-soft',
    Completed: 'text-olive-strong bg-olive-soft',
    Cancelled: 'text-muted bg-cream-pressed',
    All:       'text-olive-strong bg-olive-soft',
  };

  return (
    <div>
      <PageHeader
        title="Active Orders"
        subtitle={`${orders.filter((o) => o.status !== 'Completed').length} orders in progress`}
        action={
          <Button to="/staff/new-order">
            <PlusCircle size={18} aria-hidden="true" />
            New order
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-panel border border-line rounded-2xl p-1.5 shadow-sm overflow-x-auto">
          {TABS.map((tab) => {
            const count = tabCount(orders, tab);
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap
                  transition-all duration-150
                  ${isActive
                    ? 'bg-olive-strong text-cream shadow-sm'
                    : 'text-muted hover:bg-cream'
                  }
                `}
              >
                {tab}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                    ${isActive ? 'bg-panel text-cream' : tabColors[tab]}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 sm:ml-auto">
          <SearchBar
            placeholder="Search orders…"
            value={search}
            onChange={setSearch}
            className="w-full sm:w-56"
          />
          <button className="p-2.5 bg-panel border border-line rounded-xl text-muted hover:text-muted shadow-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CatSilhouette pose="lying" className="mb-3 h-14 w-auto" />
          <p className="text-muted font-medium">No orders found</p>
          <p className="text-muted text-sm mt-1">Try a different filter or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
