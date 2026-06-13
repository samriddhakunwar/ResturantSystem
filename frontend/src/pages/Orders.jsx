// ─── Orders Page ──────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import PageHeader from '../components/ui/PageHeader';
import SearchBar from '../components/ui/SearchBar';
import OrderCard from '../components/orders/OrderCard';
import Button from '../components/ui/Button';
import { usePOS } from '../context/PosContext';
import { PlusCircle, RefreshCw } from 'lucide-react';

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
    Pending:   'text-yellow-600 bg-yellow-50',
    Preparing: 'text-blue-600 bg-blue-50',
    Completed: 'text-green-600 bg-green-50',
    Cancelled: 'text-gray-500 bg-gray-100',
    All:       'text-orange-600 bg-orange-50',
  };

  return (
    <div>
      <PageHeader
        title="Active Orders"
        subtitle={`${orders.filter((o) => o.status !== 'Completed').length} orders in progress`}
        action={
          <Button icon={<PlusCircle className="w-4 h-4" />}>
            New Order
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
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
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {tab}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                    ${isActive ? 'bg-white/20 text-white' : tabColors[tab]}`}
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
          <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-3">🍕</span>
          <p className="text-gray-500 font-medium">No orders found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different filter or search term</p>
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
