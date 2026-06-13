// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusConfig = {
  Pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  Preparing: { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  Ready:     { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  Completed: { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
  Paid:      { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  Unpaid:    { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-400'    },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? {
    bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
