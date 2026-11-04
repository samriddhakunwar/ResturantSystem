// ─── Dashboard Page ───────────────────────────────────────────────────────────
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/charts/ChartCard';
import SalesChart from '../components/charts/SalesChart';
import ExpensesChart from '../components/charts/ExpensesChart';
import StatusBadge from '../components/ui/StatusBadge';
import PageHeader from '../components/ui/PageHeader';
import { statCards, salesChartData, expensesChartData, recentOrders, topItems } from '../data/dashboardData';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePOS } from '../context/PosContext';
import { bookingsApi, catsApi } from '../api/staff';
import { formatRs } from '../lib/format';

const todayIso = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local

/** Today's bookings and cats in the room (live only). */
function useCafeToday(enabled) {
  const [today, setToday] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    Promise.all([bookingsApi.forDay(todayIso()), catsApi.list()])
      .then(([bookings, cats]) => {
        const live = bookings.filter((b) => !['cancelled', 'no_show'].includes(b.status));
        setToday({
          bookings: live.length,
          guests: live.reduce((n, b) => n + b.party_size, 0),
          catsIn: cats.filter((c) => c.is_present_today).length,
          cats: cats.filter((c) => c.adoption_status !== 'adopted').length,
        });
      })
      .catch(() => setToday(null));
  }, [enabled]);
  return today;
}

export default function Dashboard() {
  const { apiOnline, orders, salesData, expensesData, settings } = usePOS();
  const cafeToday = useCafeToday(apiOnline);

  // QR vs POS orders placed today.
  const todays = orders.filter((o) => o.createdAt?.slice(0, 10) === todayIso());
  const qrToday = todays.filter((o) => o.source === 'qr').length;
  const cafeCards = apiOnline
    ? [
        { id: 'qr', title: 'Orders today', value: `${qrToday} QR · ${todays.length - qrToday} POS`, icon: 'QrCode' },
        { id: 'bk', title: 'Bookings today', value: String(cafeToday?.bookings ?? '–'), icon: 'CalendarDays',
          hint: cafeToday ? `${cafeToday.guests} guests expected` : undefined },
        { id: 'cats', title: 'Cats in the room', value: cafeToday ? `${cafeToday.catsIn} of ${cafeToday.cats}` : '–', icon: 'Cat' },
      ]
    : [];

  // Live sales/expenses series from the backend when available, else mock.
  const salesSeries = apiOnline && salesData ? salesData : salesChartData;
  const expensesSeries = apiOnline && expensesData ? expensesData : expensesChartData;

  // Top-selling items aggregated from live order line items (else mock).
  const topSelling = (() => {
    if (!apiOnline) return topItems;
    const agg = {};
    for (const o of orders) {
      for (const it of o.items ?? []) {
        agg[it.name] ??= { name: it.name, sold: 0, revenue: 0 };
        agg[it.name].sold += it.qty;
        agg[it.name].revenue += it.qty * it.price;
      }
    }
    const list = Object.values(agg)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map((x) => ({ name: x.name, sold: x.sold, revenue: formatRs(x.revenue) }));
    return list.length ? list : topItems;
  })();

  // KPI cards: derive live values from backend orders; keep mock styling/labels.
  const totalSales = orders.reduce((sum, o) => sum + (o.amount ?? 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const avgOrder = orders.length ? totalSales / orders.length : 0;
  const liveValues = [
    formatRs(Math.round(totalSales)),
    String(orders.length),
    String(pendingCount),
    formatRs(Math.round(avgOrder)),
  ];
  const cards = apiOnline
    ? statCards.map((c, i) => ({ ...c, value: liveValues[i] ?? c.value, growth: undefined })) // no fake trends on live data
    : statCards;

  // Recent orders: live list (amount → display string) or mock.
  const recent = apiOnline
    ? orders.slice(0, 7).map((o) => ({ ...o, amount: formatRs(o.amount ?? 0) }))
    : recentOrders;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Here's what's happening at ${settings.restaurant.name} today.`}
        action={
          <span className="text-xs bg-olive-soft text-olive-strong font-semibold px-3 py-1.5 rounded-full border border-olive">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        }
      />

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {/* ── Café today ── */}
      {cafeCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {cafeCards.map((card) => (
            <StatCard key={card.id} {...card} />
          ))}
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="Sales Overview"
          subtitle="Monthly revenue — current year"
        >
          <SalesChart data={salesSeries} />
        </ChartCard>
        <ChartCard
          title="Expenses Overview"
          subtitle="Monthly cost breakdown"
        >
          <ExpensesChart data={expensesSeries} />
        </ChartCard>
      </div>

      {/* ── Bottom Row: Recent Orders + Top Items ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-panel rounded-2xl border border-line shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div>
              <h3 className="text-base font-semibold text-charcoal">Recent Orders</h3>
              <p className="text-xs text-muted mt-0.5">Latest transactions today</p>
            </div>
            <Link
              to="/staff/orders"
              className="text-xs text-olive-strong font-semibold hover:text-olive-dark flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cream">
                  <th className="text-left text-xs font-semibold text-muted px-5 py-2.5">Order ID</th>
                  <th className="text-left text-xs font-semibold text-muted px-3 py-2.5">Customer</th>
                  <th className="text-left text-xs font-semibold text-muted px-3 py-2.5">Table</th>
                  <th className="text-left text-xs font-semibold text-muted px-3 py-2.5">Status</th>
                  <th className="text-right text-xs font-semibold text-muted px-5 py-2.5">Amount</th>
                  <th className="text-right text-xs font-semibold text-muted px-5 py-2.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((order) => (
                  <tr key={order.id} className="hover:bg-cream transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-olive-strong">{order.id}</td>
                    <td className="px-3 py-3 text-sm text-charcoal">{order.customer}</td>
                    <td className="px-3 py-3 text-xs text-muted">{order.table}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-charcoal text-right">{order.amount}</td>
                    <td className="px-5 py-3 text-xs text-muted text-right">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-panel rounded-2xl border border-line shadow-sm p-5">
          <h3 className="text-base font-semibold text-charcoal mb-1">Top Selling Items</h3>
          <p className="text-xs text-muted mb-4">This month</p>
          <div className="space-y-3">
            {topSelling.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-6 text-sm font-bold text-olive-strong tabular-nums">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 bg-cream-pressed rounded-full h-1.5">
                      <div
                        className="bg-olive h-1.5 rounded-full transition-all"
                        style={{ width: `${100 - i * 16}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted shrink-0">{item.sold} sold</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-charcoal shrink-0">{item.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
