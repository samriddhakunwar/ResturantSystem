// ─── POS Order Panel (Cart + Billing tabs) ────────────────────────────────────
import { ShoppingCart, CreditCard, Banknote, Smartphone, Printer, CheckCircle2, Trash2, FileText, ChevronRight, User, Armchair, NotebookPen } from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import PosCartItem from './PosCartItem';
import { formatRs } from '../../lib/format';

const PAYMENT_METHODS = [
  { id: 'Cash',   label: 'Cash',   icon: Banknote   },
  { id: 'Card',   label: 'Card',   icon: CreditCard },
  { id: 'Online', label: 'Online', icon: Smartphone },
];

export default function PosOrderPanel({ className = '' }) {
  const {
    cartItems, cartCustomer, cartTable, cartNotes,
    cartPayMethod, setCartPayMethod,
    activeTab, setActiveTab,
    cartSubtotal, cartTax, cartTotal, cartTaxRate, cartCount,
    clearCart, completeOrder,
    settings,
  } = usePOS();

  const isEmpty = cartItems.length === 0;

  return (
    <div className={`flex flex-col bg-panel border-l border-line h-full ${className}`}>
      {/* ── Header tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line shrink-0">
        <div className="flex flex-1 bg-cream-pressed rounded-xl p-1 gap-1">
          {[
            { id: 'cart',    label: 'Order Cart', icon: ShoppingCart },
            { id: 'billing', label: 'Billing',    icon: CreditCard   },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                ${activeTab === id ? 'bg-olive-strong text-cream shadow-sm' : 'text-muted hover:text-charcoal'}`}
            >
              <Icon size={13} />
              {label}
              {id === 'cart' && cartCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === id ? 'bg-panel' : 'bg-olive-soft text-olive-strong'}`}>
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {!isEmpty && (
          <button
            onClick={clearCart}
            className="p-2 rounded-xl text-muted hover:text-danger hover:bg-danger-soft transition-colors"
            title="Clear cart"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* ── Tab: ORDER CART ─────────────────────────────────────────────── */}
      {activeTab === 'cart' && (
        <>
          {/* Order info summary bar */}
          {(cartCustomer || cartTable) && (
            <div className="px-4 py-2 bg-olive-soft border-b border-olive flex items-center gap-3 text-xs shrink-0">
              {cartCustomer && <span className="font-semibold text-olive-strong flex items-center gap-1"><User size={12} aria-hidden="true" /> {cartCustomer}</span>}
              {cartTable    && <span className="font-semibold text-olive-strong flex items-center gap-1"><Armchair size={12} aria-hidden="true" /> {cartTable}</span>}
            </div>
          )}

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <div className="w-16 h-16 bg-olive-soft rounded-2xl flex items-center justify-center mb-3">
                  <ShoppingCart className="w-7 h-7 text-olive-soft" />
                </div>
                <p className="text-sm font-semibold text-muted">Cart is empty</p>
                <p className="text-xs text-muted mt-1">Tap menu items to add them</p>
              </div>
            ) : (
              <div>
                {cartItems.map((item) => (
                  <PosCartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Notes preview */}
          {cartNotes && (
            <div className="mx-4 mb-2 px-3 py-2 bg-ginger-soft border border-ginger rounded-xl text-xs text-ginger-ink">
              <NotebookPen size={12} aria-hidden="true" className="inline" /> {cartNotes}
            </div>
          )}

          {/* Summary */}
          {!isEmpty && (
            <div className="border-t border-line px-4 pt-3 pb-2 space-y-1.5 shrink-0">
              <div className="flex justify-between text-xs text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal">{formatRs(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>Tax ({(cartTaxRate * 100).toFixed(0)}%)</span>
                <span className="font-semibold text-charcoal">{formatRs(cartTax)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-line">
                <span className="text-sm font-bold text-charcoal">Total</span>
                <span className="text-xl font-black text-olive-strong">{formatRs(cartTotal)}</span>
              </div>
            </div>
          )}

          {/* Go to Billing CTA */}
          {!isEmpty && (
            <div className="px-4 pb-4 shrink-0">
              <button
                onClick={() => setActiveTab('billing')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-olive-strong hover:bg-olive-dark text-cream font-semibold text-sm rounded-xl transition-colors shadow-sm active:scale-[0.98]"
              >
                Proceed to Payment
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Tab: BILLING ────────────────────────────────────────────────── */}
      {activeTab === 'billing' && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
            {/* Order summary mini table */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Order Summary</p>
              <div className="bg-cream rounded-xl overflow-hidden">
                {isEmpty ? (
                  <p className="text-center text-xs text-muted py-4">No items in cart</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="text-left text-muted px-3 py-2 font-semibold">Item</th>
                        <th className="text-center text-muted px-2 py-2 font-semibold">Qty</th>
                        <th className="text-right text-muted px-3 py-2 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id} className="border-b border-line last:border-0">
                          <td className="px-3 py-2 font-medium text-charcoal line-clamp-1">{item.name}</td>
                          <td className="px-2 py-2 text-center text-muted">{item.qty}</td>
                          <td className="px-3 py-2 text-right font-semibold text-charcoal">{formatRs((item.price * item.qty))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Bill totals */}
            <div className="bg-olive-soft rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs text-muted">
                <span>Subtotal</span>
                <span className="font-semibold">{formatRs(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>Tax ({(cartTaxRate * 100).toFixed(0)}% VAT)</span>
                <span className="font-semibold">{formatRs(cartTax)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-olive mt-1">
                <span className="text-sm font-bold text-charcoal">Grand Total</span>
                <span className="text-2xl font-black text-olive-strong">{formatRs(cartTotal)}</span>
              </div>
            </div>

            {/* Order info */}
            {(cartCustomer || cartTable) && (
              <div className="bg-cream rounded-xl px-3.5 py-3 space-y-1">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Order Details</p>
                {cartCustomer && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Customer</span>
                    <span className="font-semibold text-charcoal">{cartCustomer}</span>
                  </div>
                )}
                {cartTable && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Table</span>
                    <span className="font-semibold text-charcoal">{cartTable}</span>
                  </div>
                )}
                {cartNotes && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Notes</span>
                    <span className="font-semibold text-charcoal text-right max-w-[60%]">{cartNotes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment method */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCartPayMethod(id)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-150 active:scale-95
                      ${cartPayMethod === id
                        ? 'border-olive-strong bg-olive-soft text-olive-strong'
                        : 'border-line text-muted hover:border-olive-strong hover:text-olive-dark hover:bg-olive-soft'
                      }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t border-line px-4 py-3 space-y-2 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center gap-1 py-2 rounded-xl border border-line text-[11px] font-semibold text-muted hover:border-olive-strong hover:text-olive-dark hover:bg-olive-soft transition-colors active:scale-95">
                <FileText size={14} />
                Save Bill
              </button>
              <button className="flex flex-col items-center gap-1 py-2 rounded-xl border border-line text-[11px] font-semibold text-muted hover:border-olive-strong hover:text-olive-dark hover:bg-olive-soft transition-colors active:scale-95">
                <Printer size={14} />
                Print Bill
              </button>
              <button className="flex flex-col items-center gap-1 py-2 rounded-xl border border-line text-[11px] font-semibold text-muted hover:border-olive-strong hover:text-olive-dark hover:bg-olive-soft transition-colors active:scale-95">
                <Printer size={14} />
                Print KOT
              </button>
            </div>
            <button
              onClick={completeOrder}
              disabled={isEmpty}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-olive-strong hover:bg-olive-dark disabled:bg-line disabled:text-muted text-cream font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={17} />
              Complete Order · {formatRs(cartTotal)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
