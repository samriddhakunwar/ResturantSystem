// ─── Expenses Bar Chart ───────────────────────────────────────────────────────
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatRs, formatRsShort } from '../../lib/format';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border border-line rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-charcoal mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-medium">
          {p.name}: {formatRs(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function ExpensesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={10}>
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
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
        />
        <Bar dataKey="ingredients" name="Ingredients" fill="#566139" radius={[4, 4, 0, 0]} />
        <Bar dataKey="labor" name="Labor" fill="#f48d4a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="utilities" name="Utilities" fill="#444034" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
