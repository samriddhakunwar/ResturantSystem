// ─── Invoice Card Component ───────────────────────────────────────────────────
import { useState } from 'react';
import { Printer, CreditCard, Banknote, Smartphone } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { usePOS } from '../../context/PosContext';
import Doodle from '../decor/Doodle';
import { formatRs } from '../../lib/format';

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
    { label: 'Cash', method: 'Cash', icon: <Banknote className="w-4 h-4" />, color: 'text-olive-strong bg-olive-soft border-olive hover:bg-olive-soft' },
    { label: 'Card', method: 'Card', icon: <CreditCard className="w-4 h-4" />, color: 'text-olive-strong bg-olive-soft border-olive hover:bg-olive-soft' },
    { label: 'Online', method: 'Online', icon: <Smartphone className="w-4 h-4" />, color: 'text-ginger-ink bg-ginger-soft border-ginger hover:bg-ginger-soft' },
  ];

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-panel rounded-2xl border border-line shadow-sm text-center p-6">
        <Doodle name="dot" className="w-8 mb-3" />
        <p className="text-muted font-semibold">Select an order</p>
        <p className="text-sm text-muted mt-1">Click an order on the left to preview the invoice</p>
      </div>
    );
  }

  return (
    <div className="bg-panel rounded-2xl border border-line shadow-sm overflow-hidden">
      {/* Invoice Header */}
      <div className="bg-olive-dark px-6 py-5 text-cream">
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
      <div className="px-5 py-3 bg-cream border-b border-line grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted font-medium">Customer</p>
          <p className="font-semibold text-charcoal">{invoice.customer}</p>
        </div>
        <div>
          <p className="text-muted font-medium">Table</p>
          <p className="font-semibold text-charcoal">{invoice.table}</p>
        </div>
        <div>
          <p className="text-muted font-medium">Date</p>
          <p className="font-semibold text-charcoal">{invoice.date}</p>
        </div>
        <div>
          <p className="text-muted font-medium">Time</p>
          <p className="font-semibold text-charcoal">{invoice.time}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-5 py-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left text-xs font-semibold text-muted pb-2">Item</th>
              <th className="text-center text-xs font-semibold text-muted pb-2">Qty</th>
              <th className="text-right text-xs font-semibold text-muted pb-2">Price</th>
              <th className="text-right text-xs font-semibold text-muted pb-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td className="py-2 text-charcoal font-medium">{item.name}</td>
                <td className="py-2 text-center text-muted">{item.qty}</td>
                <td className="py-2 text-right text-muted">{formatRs(item.price)}</td>
                <td className="py-2 text-right text-charcoal font-semibold">
                  {formatRs((item.price * item.qty))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-5 py-3 border-t border-dashed border-line space-y-1.5">
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span className="font-medium">{formatRs(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted">
          <span>Tax ({(invoice.taxRate * 100).toFixed(0)}%)</span>
          <span className="font-medium">{formatRs(invoice.tax)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-charcoal pt-2 border-t border-line">
          <span>Grand Total</span>
          <span className="text-olive-strong text-lg">{formatRs(invoice.total)}</span>
        </div>
      </div>

      {/* Payment Actions */}
      {invoice.paymentStatus !== 'Paid' && (
        <div className="px-5 pb-4">
          <p className="text-xs font-semibold text-muted mb-2">Select Payment Method</p>
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
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-olive-dark hover:bg-olive-dark disabled:opacity-60 text-cream text-sm font-semibold rounded-xl transition-all duration-150 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          {printing ? 'Printing…' : 'Print Receipt'}
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 text-center text-xs text-muted border-t border-line pt-3">
        <p>{settings.receipt.thankYouMessage}</p>
        <p className="mt-0.5">{settings.receipt.footerNote}</p>
      </div>
    </div>
  );
}
