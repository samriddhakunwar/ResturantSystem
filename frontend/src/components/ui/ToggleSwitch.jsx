// ─── Toggle Switch ────────────────────────────────────────────────────────────
export default function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        {label && <p className="text-sm font-medium text-charcoal">{label}</p>}
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-olive-soft focus:ring-offset-1
          ${checked ? 'bg-olive-strong' : 'bg-line'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 rounded-full bg-panel shadow-md
            transform transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}
