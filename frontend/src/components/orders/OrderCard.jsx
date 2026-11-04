// ─── Order Card Component ─────────────────────────────────────────────────────
import { useState } from 'react';
import { Clock, MapPin, Printer, CheckCircle2, XCircle, ChefHat } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import { usePOS } from '../../context/PosContext';

export default function OrderCard({ order }) {
  const { updateOrderStatus, printKitchenTicket } = usePOS();
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    const res = await printKitchenTicket(order.backendId);
    setPrinting(false);
    if (!res.ok) alert(res.message);
  };

  // Mirrors the backend transitions: pending → preparing → completed.
  const getNextStatus = (current) => {
    const map = { Pending: 'Preparing', Preparing: 'Completed' };
    return map[current];
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-olive-strong">{order.id}</p>
            <p className="text-base font-semibold text-gray-900 mt-0.5">{order.customer}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" /> {order.table}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" /> {order.time}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="px-4 py-3 space-y-1.5 min-h-[90px]">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-gray-700">
              <span className="font-semibold text-gray-500 mr-1">×{item.qty}</span>
              {item.name}
            </span>
            <span className="text-gray-600 font-medium">Rs {(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">Rs {order.amount.toFixed(2)}</p>
          </div>
          <StatusBadge status={order.paymentStatus} />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {nextStatus && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => updateOrderStatus(order.id, nextStatus)}
              className="flex-1"
            >
              {nextStatus === 'Completed' ? <CheckCircle2 size={16} aria-hidden="true" /> : <ChefHat size={16} aria-hidden="true" />}
              {nextStatus === 'Preparing' ? 'Start' : 'Complete'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            disabled={printing}
          >
            <Printer size={16} aria-hidden="true" />
            {printing ? 'Printing…' : 'Print KOT'}
          </Button>
          {order.status !== 'Completed' && order.status !== 'Cancelled' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateOrderStatus(order.id, 'Cancelled')}
            >
              <XCircle size={16} aria-hidden="true" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
