// ─── POS Context ──────────────────────────────────────────────────────────────
// Central state + integration seam. When VITE_API_URL is configured and the
// backend is reachable, all menu/order/billing data is loaded from and written
// to the Django REST API (via src/api). If the backend is unreachable, the app
// transparently falls back to the bundled mock data so the UI still works.
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ordersData } from '../data/ordersData';
import { defaultSettings } from '../data/settingsData';
import { initialMenuData, getNextId } from '../data/menuManagementData';
import { billingOrders } from '../data/billingData';
import {
  isApiConfigured,
  menuApi,
  ordersApi,
  billingApi,
  printersApi,
  reportsApi,
} from '../api';

const PosContext = createContext(null);

export function PosProvider({ children }) {
  // ── Connectivity ────────────────────────────────────────────────────────────
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(isApiConfigured);
  const online = isApiConfigured && apiOnline;

  // ── Core state ──────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState(ordersData);
  const [bills, setBills] = useState(billingOrders);
  const [settings, setSettings] = useState(defaultSettings);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);

  // ── Menu state ────────────────────────────────────────────────────────────
  const [menuItems, setMenuItems] = useState(initialMenuData);
  const [categories, setCategories] = useState([]); // [{id, name}] when online

  // ── Printers & live analytics ───────────────────────────────────────────────
  const [printers, setPrinters] = useState([]);
  const [salesData, setSalesData] = useState(null); // live sales-by-month, else null

  // ── Initial load from backend (with mock fallback) ──────────────────────────
  useEffect(() => {
    if (!isApiConfigured) return;
    let cancelled = false;

    (async () => {
      try {
        const [menu, cats, orderList] = await Promise.all([
          menuApi.list(),
          menuApi.categories(),
          ordersApi.list(),
        ]);
        const invoices = await billingApi.list(orderList).catch(() => []);
        // Non-critical extras — never let them break the core load.
        const year = new Date().getFullYear();
        const [printerList, sales] = await Promise.all([
          printersApi.list().catch(() => []),
          reportsApi.salesByMonth(year).catch(() => []),
        ]);
        if (cancelled) return;
        setMenuItems(menu);
        setCategories(cats);
        setOrders(orderList);
        setBills(invoices);
        setPrinters(printerList);
        setSalesData(sales.length ? sales : null);
        setApiOnline(true);
      } catch (err) {
        // Backend down / CORS / not migrated → stay on mock data.
        console.warn('[POS] Backend unreachable, using mock data:', err?.message ?? err);
        if (!cancelled) setApiOnline(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const resolveCategoryId = useCallback(
    (name) => categories.find((c) => c.name === name)?.id ?? categories[0]?.id,
    [categories],
  );

  // ── Menu CRUD ───────────────────────────────────────────────────────────────
  const addMenuItem = useCallback(
    async (item) => {
      if (online) {
        try {
          const created = await menuApi.create({
            name: item.name,
            category: resolveCategoryId(item.category),
            price: Number(item.price),
            description: item.description ?? '',
            is_available: item.available ?? true,
          });
          setMenuItems((prev) => [...prev, created]);
          return;
        } catch (err) {
          console.error('[POS] addMenuItem failed:', err?.message ?? err);
        }
      }
      setMenuItems((prev) => [...prev, { ...item, id: getNextId() }]);
    },
    [online, resolveCategoryId],
  );

  const deleteMenuItem = useCallback(
    async (id) => {
      if (online) {
        try {
          await menuApi.remove(id);
        } catch (err) {
          console.error('[POS] deleteMenuItem failed:', err?.message ?? err);
        }
      }
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
    },
    [online],
  );

  const updateMenuItemPrice = useCallback(
    async (id, price) => {
      if (online) {
        try {
          const updated = await menuApi.update(id, { price: Number(price) });
          setMenuItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
          return;
        } catch (err) {
          console.error('[POS] updateMenuItemPrice failed:', err?.message ?? err);
        }
      }
      setMenuItems((prev) =>
        prev.map((m) => (m.id === id ? { ...m, price: Number(price) } : m)),
      );
    },
    [online],
  );

  const toggleMenuItemAvailability = useCallback(
    async (id) => {
      const current = menuItems.find((m) => m.id === id);
      if (online && current) {
        try {
          const updated = await menuApi.update(id, { is_available: !current.available });
          setMenuItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
          return;
        } catch (err) {
          console.error('[POS] toggleMenuItemAvailability failed:', err?.message ?? err);
        }
      }
      setMenuItems((prev) =>
        prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m)),
      );
    },
    [online, menuItems],
  );

  const updateMenuItem = useCallback(
    async (id, updates) => {
      if (online) {
        try {
          const patch = {};
          if (updates.name !== undefined) patch.name = updates.name;
          if (updates.price !== undefined) patch.price = Number(updates.price);
          if (updates.description !== undefined) patch.description = updates.description;
          if (updates.available !== undefined) patch.is_available = updates.available;
          if (updates.category !== undefined) patch.category = resolveCategoryId(updates.category);
          const updated = await menuApi.update(id, patch);
          setMenuItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
          return;
        } catch (err) {
          console.error('[POS] updateMenuItem failed:', err?.message ?? err);
        }
      }
      setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    },
    [online, resolveCategoryId],
  );

  // ── Cart state ──────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState([]);
  const [cartCustomer, setCartCustomer] = useState('');
  const [cartTable, setCartTable]       = useState('');
  const [cartNotes, setCartNotes]       = useState('');
  const [cartPayMethod, setCartPayMethod] = useState('Cash');
  const [activeTab, setActiveTab]       = useState('cart');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const incrementQty = useCallback((id) => {
    setCartItems((prev) =>
      prev.map((c) => c.id === id ? { ...c, qty: c.qty + 1 } : c)
    );
  }, []);

  const decrementQty = useCallback((id) => {
    setCartItems((prev) => {
      const item = prev.find((c) => c.id === id);
      if (!item) return prev;
      if (item.qty <= 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartCustomer('');
    setCartTable('');
    setCartNotes('');
    setCartPayMethod('Cash');
    setActiveTab('cart');
  }, []);

  const getItemQty = useCallback((id) => {
    const item = cartItems.find((c) => c.id === id);
    return item ? item.qty : 0;
  }, [cartItems]);

  // ── Order totals ────────────────────────────────────────────────────────────
  const cartSubtotal = cartItems.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartTaxRate  = settings.restaurant.taxRate / 100;
  const cartTax      = cartSubtotal * cartTaxRate;
  const cartTotal    = cartSubtotal + cartTax;
  const cartCount    = cartItems.reduce((sum, c) => sum + c.qty, 0);

  // ── Complete order ──────────────────────────────────────────────────────────
  const completeOrder = useCallback(async () => {
    if (cartItems.length === 0) return;

    if (online) {
      try {
        const created = await ordersApi.create(
          cartItems.map((c) => ({ id: c.id, qty: c.qty })),
          cartCustomer,
          cartTable,
          cartNotes,
        );
        setOrders((prev) => [created, ...prev]);
        clearCart();
        return;
      } catch (err) {
        console.error('[POS] completeOrder failed:', err?.message ?? err);
        // fall through to local behavior so the cashier isn't blocked
      }
    }

    const newOrder = {
      id: `#ORD-${1025 + orders.length}`,
      backendId: null,
      customer: cartCustomer || 'Walk-in Customer',
      table: cartTable || 'Takeaway',
      status: 'Pending',
      paymentStatus: cartPayMethod !== 'Cash' ? 'Paid' : 'Unpaid',
      paymentMethod: cartPayMethod,
      amount: cartTotal,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      notes: cartNotes,
      items: cartItems.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
  }, [online, cartItems, cartCustomer, cartTable, cartNotes, cartPayMethod, cartTotal, orders.length, clearCart]);

  // ── Order actions ───────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      const target = orders.find((o) => o.id === orderId);
      if (online && target?.backendId) {
        try {
          const updated = await ordersApi.updateStatus(target.backendId, newStatus);
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
          return;
        } catch (err) {
          console.error('[POS] updateOrderStatus failed:', err?.message ?? err);
          return; // backend rejected the transition — don't desync the UI
        }
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    },
    [online, orders],
  );

  // Record a payment. In billing views `ref` is a bill id (online) or order id (mock).
  const updatePaymentStatus = useCallback(
    async (ref, method) => {
      if (online) {
        const invoice = bills.find((b) => b.orderId === ref || b.billId === ref);
        if (invoice) {
          try {
            await billingApi.pay(invoice.billId, invoice.total, method);
            setBills((prev) =>
              prev.map((b) =>
                b.billId === invoice.billId
                  ? { ...b, paymentStatus: 'Paid', paymentMethod: method }
                  : b,
              ),
            );
            return;
          } catch (err) {
            console.error('[POS] payment failed:', err?.message ?? err);
          }
        }
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === ref ? { ...o, paymentStatus: 'Paid', paymentMethod: method } : o,
        ),
      );
      setBills((prev) =>
        prev.map((b) =>
          b.orderId === ref || b.id === ref
            ? { ...b, paymentStatus: 'Paid', paymentMethod: method }
            : b,
        ),
      );
    },
    [online, bills],
  );

  // ── Thermal printing ────────────────────────────────────────────────────────
  const printersAvailable = online && printers.some((p) => p.isActive);

  const sendPrint = useCallback(
    async (kind, orderBackendId) => {
      if (!online) return { ok: false, message: 'Printing requires the backend (offline)' };
      if (!orderBackendId) return { ok: false, message: 'Save the order before printing' };
      const printer = printersApi.pickPrinter(printers, kind === 'kitchen' ? 'kitchen' : 'billing');
      if (!printer) return { ok: false, message: 'No active printer configured' };
      try {
        const job =
          kind === 'kitchen'
            ? await printersApi.printKitchenTicket(printer.id, orderBackendId)
            : await printersApi.printBill(printer.id, orderBackendId);
        if (job.status === 'failed') {
          return { ok: false, message: job.error_message || 'Printer reported a failure' };
        }
        return { ok: true, message: `Sent to ${printer.name}` };
      } catch (err) {
        return { ok: false, message: err?.message || 'Print request failed' };
      }
    },
    [online, printers],
  );

  const printKitchenTicket = useCallback(
    (orderBackendId) => sendPrint('kitchen', orderBackendId),
    [sendPrint],
  );
  const printBill = useCallback(
    (orderBackendId) => sendPrint('billing', orderBackendId),
    [sendPrint],
  );

  const refreshPrinters = useCallback(async () => {
    if (!online) return;
    try {
      setPrinters(await printersApi.list());
    } catch (err) {
      console.error('[POS] refreshPrinters failed:', err?.message ?? err);
    }
  }, [online]);

  const addPrinter = useCallback(
    async (input) => {
      if (!online) return { ok: false, message: 'Connect the backend to manage printers' };
      try {
        await printersApi.create(input);
        await refreshPrinters();
        return { ok: true, message: 'Printer added' };
      } catch (err) {
        const detail = err?.body ? JSON.stringify(err.body) : err?.message;
        return { ok: false, message: detail || 'Could not add printer' };
      }
    },
    [online, refreshPrinters],
  );

  const togglePrinterActive = useCallback(
    async (id, isActive) => {
      if (!online) return;
      try {
        await printersApi.setActive(id, isActive);
        await refreshPrinters();
      } catch (err) {
        console.error('[POS] togglePrinterActive failed:', err?.message ?? err);
      }
    },
    [online, refreshPrinters],
  );

  const removePrinter = useCallback(
    async (id) => {
      if (!online) return;
      try {
        await printersApi.remove(id);
        setPrinters((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error('[POS] removePrinter failed:', err?.message ?? err);
      }
    },
    [online],
  );

  const testPrintPrinter = useCallback(
    async (id) => {
      if (!online) return { ok: false, message: 'Connect the backend to test printers' };
      try {
        const job = await printersApi.testPrint(id);
        if (job.status === 'failed') {
          return { ok: false, message: job.error_message || 'Printer reported a failure' };
        }
        return { ok: true, message: 'Test page sent' };
      } catch (err) {
        return { ok: false, message: err?.message || 'Test print failed' };
      }
    },
    [online],
  );

  const updateSettings = useCallback((section, values) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...values },
    }));
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const value = {
    // Connectivity
    apiOnline: online,
    loading,
    // Core
    orders,
    bills,
    salesData,
    printers,
    printersAvailable,
    printKitchenTicket,
    printBill,
    refreshPrinters,
    addPrinter,
    togglePrinterActive,
    removePrinter,
    testPrintPrinter,
    settings,
    sidebarOpen,
    activeOrder,
    setActiveOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateSettings,
    toggleSidebar,
    // Menu management
    menuItems,
    categories,
    addMenuItem,
    deleteMenuItem,
    updateMenuItemPrice,
    toggleMenuItemAvailability,
    updateMenuItem,
    // Cart
    cartItems,
    cartCustomer, setCartCustomer,
    cartTable,    setCartTable,
    cartNotes,    setCartNotes,
    cartPayMethod, setCartPayMethod,
    activeTab,    setActiveTab,
    cartDrawerOpen, setCartDrawerOpen,
    addToCart,
    removeFromCart,
    incrementQty,
    decrementQty,
    clearCart,
    getItemQty,
    cartSubtotal,
    cartTax,
    cartTotal,
    cartTaxRate,
    cartCount,
    completeOrder,
  };

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
}

export function usePOS() {
  const ctx = useContext(PosContext);
  if (!ctx) throw new Error('usePOS must be used within PosProvider');
  return ctx;
}
