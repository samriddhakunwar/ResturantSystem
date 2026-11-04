// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusConfig = {
  Pending:   { bg: 'bg-ginger-soft', text: 'text-ginger-ink', dot: 'bg-ginger' },
  Preparing: { bg: 'bg-olive-soft',   text: 'text-olive-strong',   dot: 'bg-olive-strong'   },
  Ready:     { bg: 'bg-olive-soft',  text: 'text-olive-strong',  dot: 'bg-olive-strong'  },
  Completed: { bg: 'bg-cream-pressed',   text: 'text-muted',   dot: 'bg-disabled'   },
  Paid:      { bg: 'bg-olive-soft',  text: 'text-olive-strong',  dot: 'bg-olive-strong'  },
  Unpaid:    { bg: 'bg-danger-soft',    text: 'text-danger',    dot: 'bg-danger'    },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? {
    bg: 'bg-cream-pressed', text: 'text-muted', dot: 'bg-disabled',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
