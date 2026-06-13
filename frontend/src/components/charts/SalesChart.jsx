// ─── Sales Area Chart ─────────────────────────────────────────────────────────
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3">
      <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-sm font-bold text-orange-500">
        ${payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
};

export default function SalesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff5a1f" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ff5a1f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#ff5a1f"
          strokeWidth={2.5}
          fill="url(#salesGrad)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0, fill: '#ff5a1f' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
