// ─── Chart Card Wrapper ───────────────────────────────────────────────────────
export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-panel rounded-2xl border border-line shadow-sm p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-charcoal">{title}</h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
