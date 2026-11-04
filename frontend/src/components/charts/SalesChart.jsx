// ─── Sales Area Chart ─────────────────────────────────────────────────────────
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatRs, formatRsShort } from '../../lib/format';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border border-line rounded-xl shadow-lg p-3">
      <p className="text-xs font-semibold text-muted mb-1">{label}</p>
      <p className="text-sm font-bold text-olive-strong">
        {formatRs(payload[0]?.value ?? 0)}
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
            <stop offset="5%" stopColor="#566139" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#566139" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#c9b996" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#625a49' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#625a49' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatRsShort}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#566139"
          strokeWidth={2.5}
          fill="url(#salesGrad)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0, fill: '#566139' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
