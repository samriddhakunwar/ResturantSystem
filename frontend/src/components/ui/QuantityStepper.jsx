// ─── Quantity Stepper ─────────────────────────────────────────────────────────
// Minus/plus pill (ui-kit/components/QuantityStepper.md). In the cart
// (`removable`), minus at quantity 1 removes the line and is labelled
// "Remove". Capped at 20 to match the server-side limit.
export default function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  max = 20,
  removable = false,
  className = '',
}) {
  const removes = removable && value <= 1;
  const atMin = !removable && value <= min;

  return (
    <div className={`wb-qty ${className}`} role="group" aria-label={label}>
      <button
        type="button"
        aria-label={removes ? 'Remove' : 'Decrease'}
        disabled={atMin}
        onClick={() => onChange(removes ? 0 : value - 1)}
      >
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(value + 1, max))}
      >
        +
      </button>
    </div>
  );
}
