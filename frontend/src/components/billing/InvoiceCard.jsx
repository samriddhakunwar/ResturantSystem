// ─── Invoice Card Component ───────────────────────────────────────────────────
import { useState } from 'react';
import { Printer, CreditCard, Banknote, Smartphone } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { usePOS } from '../../context/PosContext';
import Doodle from '../decor/Doodle';

export default function InvoiceCard({ invoice }) {
  const { updatePaymentStatus, printBill, settings } = usePOS();
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    const res = await printBill(invoice?.orderId);
    setPrinting(false);
    if (!res.ok) alert(res.message);
  };

  const paymentMethods = [
    { label: 'Cash', method: 'Cash', icon: <Banknote className="w-4 h-4" />, color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' },
    { label: 'Card', method: 'Card', icon: <CreditCard className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { label: 'Online', method: 'Online', icon: <Smartphone className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100' },
  ];

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm text-center p-6">
        <Doodle name="dot" className="w-8 mb-3" />
        <p className="text-gray-500 font-semibold">Select an order</p>
        <p className="text-sm text-gray-400 mt-1">Click an order on the left to preview the invoice</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Invoice Header */}
      <div className="bg-olive-dark px-6 py-5 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div>
            <p className="font-display text-lg font-extrabold leading-tight">{settings.restaurant.name}</p>
            <p className="text-olive-soft text-xs">{settings.restaurant.address}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-olive-soft text-xs">Invoice</p>
            <p className="font-bold text-xl">{invoice.id}</p>
          </div>
          <StatusBadge status={invoice.paymentStatus} />
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-400 font-medium">Customer</p>
          <p className="font-semibold text-gray-800">{invoice.customer}</p>
        </div>
        <div>
          <p className="text-gray-400 font-medium">Table</p>
          <p className="font-semibold text-gray-800">{invoice.table}</p>
        </div>
        <div>
          <p className="text-gray-400 font-medium">Date</p>
          <p className="font-semibold text-gray-800">{invoice.date}</p>
        </div>
        <div>
          <p className="text-gray-400 font-medium">Time</p>
          <p className="font-semibold text-gray-800">{invoice.time}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-5 py-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-400 pb-2">Item</th>
              <th className="text-center text-xs font-semibold text-gray-400 pb-2">Qty</th>
              <th className="text-right text-xs font-semibold text-gray-400 pb-2">Price</th>
              <th className="text-right text-xs font-semibold text-gray-400 pb-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td className="py-2 text-gray-800 font-medium">{item.name}</td>
                <td className="py-2 text-center text-gray-500">{item.qty}</td>
                <td className="py-2 text-right text-gray-500">Rs {item.price.toFixed(2)}</td>
                <td className="py-2 text-right text-gray-800 font-semibold">
                  Rs {(item.price * item.qty).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-5 py-3 border-t border-dashed border-gray-200 space-y-1.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">Rs {invoice.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax ({(invoice.taxRate * 100).toFixed(0)}%)</span>
          <span className="font-medium">Rs {invoice.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
          <span>Grand Total</span>
          <span className="text-olive-strong text-lg">Rs {invoice.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Actions */}
      {invoice.paymentStatus !== 'Paid' && (
        <div className="px-5 pb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Select Payment Method</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {paymentMethods.map(({ label, method, icon, color }) => (
              <button
                key={method}
                onClick={() => updatePaymentStatus(invoice.orderId, method)}
                className={`
                  flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl
                  border text-xs font-semibold transition-all duration-150 active:scale-95
                  ${color}
                `}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Print Receipt */}
      <div className="px-5 pb-4">
        <button
          onClick={handlePrint}
          disabled={printing}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all duration-150 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          {printing ? 'Printing…' : 'Print Receipt'}
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 text-center text-xs text-gray-400 border-t border-gray-100 pt-3">
        <p>{settings.receipt.thankYouMessage}</p>
        <p className="mt-0.5">{settings.receipt.footerNote}</p>
      </div>
    </div>
  );
}
