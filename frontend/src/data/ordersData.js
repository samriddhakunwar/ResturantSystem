// ─── Orders Mock Data ─────────────────────────────────────────────────────────
// Offline-demo orders. Amounts are item subtotals in NPR (VAT and service
// charge are added on the bill).

const order = (n, customer, table, status, paymentStatus, time, items, extra = {}) => ({
  id: `ORD-${String(n).padStart(6, '0')}`,
  backendId: null,
  customer,
  table,
  status,
  paymentStatus,
  paymentMethod: paymentStatus === 'Paid' ? 'Cash' : null,
  amount: items.reduce((sum, i) => sum + i.qty * i.price, 0),
  time,
  notes: '',
  source: 'pos',
  confirmed: true,
  items,
  ...extra,
});

export const ordersData = [
  order(1024, 'Aarav Sharma', 'Table 4', 'Completed', 'Paid', '09:05 AM', [
    { name: 'Catpuccino', qty: 2, price: 280 },
    { name: 'Whisker Waffles', qty: 1, price: 380 },
  ]),
  order(1025, 'Walk-in Customer', 'Table 2', 'Preparing', 'Unpaid', '09:18 AM', [
    { name: 'Purrfect Masala Chiya', qty: 2, price: 120 },
    { name: 'Kitten Mitten Cookies', qty: 1, price: 180 },
  ]),
  order(1026, 'Walk-in Customer', 'Table 6', 'Ready', 'Unpaid', '09:24 AM', [
    { name: 'Tuna Melt Paws', qty: 1, price: 450 },
    { name: 'Iced Catpuccino', qty: 1, price: 300 },
  ]),
  order(1027, 'Guest', 'Table 3', 'Pending', 'Unpaid', '09:31 AM', [
    { name: 'Meow-cha Latte', qty: 1, price: 320 },
    { name: 'Paw-ffle Fries', qty: 1, price: 250 },
  ], { source: 'qr', confirmed: false, notes: 'Less sugar, please' }),
  order(1028, 'Walk-in Customer', 'Table 8', 'Served', 'Unpaid', '09:40 AM', [
    { name: 'Chicken Momo Meow-dley', qty: 2, price: 360 },
    { name: 'Mango Lassi Leap', qty: 2, price: 260 },
  ]),
];
