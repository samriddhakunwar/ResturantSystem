// ─── Kitchen Status (Placeholder) ────────────────────────────────────────────
import PageHeader from '../components/ui/PageHeader';
import { usePOS } from '../context/PosContext';
import StatusBadge from '../components/ui/StatusBadge';
import { Clock } from 'lucide-react';

export default function Kitchen() {
  const { orders } = usePOS();
  const kitchenOrders = orders.filter((o) => ['Pending', 'Preparing', 'Ready'].includes(o.status));

  return (
    <div>
      <PageHeader
        title="Kitchen Status"
        subtitle="Live view of all active orders in the kitchen"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {['Pending', 'Preparing', 'Ready'].map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          const colors = {
            Pending:   'border-yellow-200 bg-yellow-50 text-yellow-700',
            Preparing: 'border-blue-200 bg-blue-50 text-blue-700',
            Ready:     'border-green-200 bg-green-50 text-green-700',
          };
          return (
            <div key={status} className={`border-2 rounded-2xl p-4 text-center ${colors[status]}`}>
              <p className="text-3xl font-bold">{count}</p>
              <p className="text-sm font-semibold mt-0.5">{status}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kitchenOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-orange-500">{order.id}</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="font-semibold text-gray-900 mb-1">{order.customer}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
              <Clock className="w-3 h-3" /> {order.time} · {order.table}
            </p>
            <ul className="space-y-1.5">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    <span className="font-bold text-gray-900 mr-1">×{item.qty}</span>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {kitchenOrders.length === 0 && (
          <div className="col-span-3 text-center py-20 text-gray-400">
            <span className="text-5xl">✅</span>
            <p className="mt-3 font-semibold">All caught up! No active kitchen orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
