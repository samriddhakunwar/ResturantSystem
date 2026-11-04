// ─── Billing Mock Data ────────────────────────────────────────────────────────
// Offline-demo invoices built from the mock orders with the backend's formula:
// 10% service charge on the subtotal, then 13% VAT on (subtotal + service).
import { ordersData } from './ordersData';

const round2 = (n) => Math.round(n * 100) / 100;

export const billingOrders = ordersData
  .filter((o) => ['Completed', 'Served'].includes(o.status))
  .map((o, i) => {
    const subtotal = o.amount;
    const serviceCharge = round2(subtotal * 0.1);
    const tax = round2((subtotal + serviceCharge) * 0.13);
    return {
      id: `BILL-${String(1001 + i).padStart(6, '0')}`,
      billId: null,
      orderId: o.id,
      customer: o.customer,
      table: o.table,
      date: new Date().toLocaleDateString('en-CA'),
      time: o.time,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      items: o.items,
      subtotal,
      serviceCharge,
      taxRate: 0.13,
      tax,
      total: round2(subtotal + serviceCharge + tax),
    };
  });
