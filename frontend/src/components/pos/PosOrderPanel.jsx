// ─── POS Order Panel (Cart + Billing tabs) ────────────────────────────────────
import { ShoppingCart, CreditCard, Banknote, Smartphone, Printer, CheckCircle2, Trash2, FileText, ChevronRight } from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import PosCartItem from './PosCartItem';

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
    <div className={`flex flex-col bg-white border-l border-gray-100 h-full ${className}`}>
      {/* ── Header tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex flex-1 bg-gray-100 rounded-xl p-1 gap-1">
          {[
            { id: 'cart',    label: 'Order Cart', icon: ShoppingCart },
            { id: 'billing', label: 'Billing',    icon: CreditCard   },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                ${activeTab === id ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={13} />
              {label}
              {id === 'cart' && cartCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === id ? 'bg-white/20' : 'bg-orange-100 text-orange-600'}`}>
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {!isEmpty && (
          <button
            onClick={clearCart}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
            <div className="px-4 py-2 bg-orange-50 border-b border-orange-100 flex items-center gap-3 text-xs shrink-0">
              {cartCustomer && <span className="font-semibold text-orange-700 flex items-center gap-1">👤 {cartCustomer}</span>}
              {cartTable    && <span className="font-semibold text-orange-700 flex items-center gap-1">🪑 {cartTable}</span>}
            </div>
          )}

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-3">
                  <ShoppingCart className="w-7 h-7 text-orange-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Cart is empty</p>
                <p className="text-xs text-gray-400 mt-1">Tap menu items to add them</p>
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
            <div className="mx-4 mb-2 px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-700">
              📝 {cartNotes}
            </div>
          )}

          {/* Summary */}
          {!isEmpty && (
            <div className="border-t border-gray-100 px-4 pt-3 pb-2 space-y-1.5 shrink-0">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-700">Rs {cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tax ({(cartTaxRate * 100).toFixed(0)}%)</span>
                <span className="font-semibold text-gray-700">Rs {cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-orange-500">Rs {cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Go to Billing CTA */}
          {!isEmpty && (
            <div className="px-4 pb-4 shrink-0">
              <button
                onClick={() => setActiveTab('billing')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm shadow-orange-200 active:scale-[0.98]"
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
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Summary</p>
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                {isEmpty ? (
                  <p className="text-center text-xs text-gray-400 py-4">No items in cart</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-gray-500 px-3 py-2 font-semibold">Item</th>
                        <th className="text-center text-gray-500 px-2 py-2 font-semibold">Qty</th>
                        <th className="text-right text-gray-500 px-3 py-2 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-3 py-2 font-medium text-gray-700 line-clamp-1">{item.name}</td>
                          <td className="px-2 py-2 text-center text-gray-500">{item.qty}</td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-800">Rs {(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Bill totals */}
            <div className="bg-orange-50 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">Rs {cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tax ({(cartTaxRate * 100).toFixed(0)}% VAT)</span>
                <span className="font-semibold">Rs {cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-orange-100 mt-1">
                <span className="text-sm font-bold text-gray-900">Grand Total</span>
                <span className="text-2xl font-black text-orange-500">Rs {cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Order info */}
            {(cartCustomer || cartTable) && (
              <div className="bg-gray-50 rounded-xl px-3.5 py-3 space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Order Details</p>
                {cartCustomer && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Customer</span>
                    <span className="font-semibold text-gray-800">{cartCustomer}</span>
                  </div>
                )}
                {cartTable && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Table</span>
                    <span className="font-semibold text-gray-800">{cartTable}</span>
                  </div>
                )}
                {cartNotes && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Notes</span>
                    <span className="font-semibold text-gray-800 text-right max-w-[60%]">{cartNotes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment method */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCartPayMethod(id)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-150 active:scale-95
                      ${cartPayMethod === id
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'
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
          <div className="border-t border-gray-100 px-4 py-3 space-y-2 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center gap-1 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-colors active:scale-95">
                <FileText size={14} />
                Save Bill
              </button>
              <button className="flex flex-col items-center gap-1 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-colors active:scale-95">
                <Printer size={14} />
                Print Bill
              </button>
              <button className="flex flex-col items-center gap-1 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-colors active:scale-95">
                <Printer size={14} />
                Print KOT
              </button>
            </div>
            <button
              onClick={completeOrder}
              disabled={isEmpty}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-orange-200 active:scale-[0.98] disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={17} />
              Complete Order · Rs {cartTotal.toFixed(2)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
