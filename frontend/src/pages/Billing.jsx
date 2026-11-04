// ─── Billing Page ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import InvoiceCard from '../components/billing/InvoiceCard';
import StatusBadge from '../components/ui/StatusBadge';
import SearchBar from '../components/ui/SearchBar';
import { usePOS } from '../context/PosContext';
import { Clock, MapPin } from 'lucide-react';
import { formatRs } from '../lib/format';

export default function Billing() {
  const { bills: billingOrders } = usePOS();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = billingOrders.filter((inv) => {
    const q = search.toLowerCase();
    return (
      !q ||
      inv.id.toLowerCase().includes(q) ||
      inv.customer.toLowerCase().includes(q) ||
      inv.table.toLowerCase().includes(q)
    );
  });

  const selected = billingOrders.find((inv) => inv.id === selectedId) ?? null;

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Manage payments and print receipts"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 h-full">
        {/* ── Left: Order List ── */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <SearchBar
            placeholder="Search invoices…"
            value={search}
            onChange={setSearch}
          />

          {/* Summary strip */}
          <div className="flex gap-2">
            {[
              { label: 'Paid', count: billingOrders.filter(i => i.paymentStatus === 'Paid').length, color: 'text-olive-strong bg-olive-soft' },
              { label: 'Unpaid', count: billingOrders.filter(i => i.paymentStatus === 'Unpaid').length, color: 'text-danger bg-danger-soft' },
            ].map(({ label, count, color }) => (
              <div key={label} className={`flex-1 rounded-xl px-3 py-2 text-center ${color}`}>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
            <div className="flex-1 rounded-xl px-3 py-2 text-center bg-olive-soft text-olive-strong">
              <p className="text-xl font-bold">{billingOrders.length}</p>
              <p className="text-xs font-medium">Total</p>
            </div>
          </div>

          {/* Orders list */}
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-260px)] pr-0.5">
            {filtered.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelectedId(inv.id)}
                className={`
                  w-full text-left p-4 rounded-2xl border transition-all duration-150
                  ${selectedId === inv.id
                    ? 'border-olive bg-olive-soft shadow-sm'
                    : 'border-line bg-panel hover:border-olive-strong hover:bg-olive-soft shadow-sm'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <p className="text-sm font-bold text-olive-strong">{inv.id}</p>
                    <p className="text-sm font-semibold text-charcoal">{inv.customer}</p>
                  </div>
                  <StatusBadge status={inv.paymentStatus} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <MapPin className="w-3 h-3" /> {inv.table}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="w-3 h-3" /> {inv.time}
                  </span>
                  <span className="ml-auto text-sm font-bold text-charcoal">{formatRs(inv.total)}</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-muted">
                <p>No results found</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Invoice Preview ── */}
        <div className="lg:col-span-3">
          <InvoiceCard invoice={selected} />
        </div>
      </div>
    </div>
  );
}
