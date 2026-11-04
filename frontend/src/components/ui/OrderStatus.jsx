// ─── Order Status ─────────────────────────────────────────────────────────────
// Five-step tracker (ui-kit/components/OrderStatus.md):
// Received → Confirmed → Brewing → Ready → Served, with the walking cat above
// the current step. The heading says the step in words and lives in an
// aria-live region so screen readers announce changes.
import CatSilhouette from '../decor/CatSilhouette';
import { PAWS } from '../decor/assets';

export const ORDER_STEPS = [
  { key: 'received', label: 'Received', heading: "We've got your order" },
  { key: 'confirmed', label: 'Confirmed', heading: 'Your order is confirmed' },
  { key: 'brewing', label: 'Brewing', heading: 'Your order is brewing' },
  { key: 'ready', label: 'Ready', heading: 'Your order is ready' },
  { key: 'served', label: 'Served', heading: 'Enjoy, your order is served' },
];

export default function OrderStatus({ step, subtitle, className = '' }) {
  const cancelled = step === 'cancelled';
  const current = Math.max(0, ORDER_STEPS.findIndex((s) => s.key === step));
  // Step centres sit at 10%, 30% … 90% of the five-column grid.
  const pos = 10 + current * 20;

  return (
    <div className={className}>
      <div aria-live="polite" aria-atomic="true">
        <h2 className="m-0 font-display text-2xl font-extrabold leading-8 text-olive-dark">
          {cancelled ? 'This order was cancelled' : ORDER_STEPS[current].heading}
        </h2>
        {subtitle && <p className="m-0 mt-1 text-sm text-muted">{subtitle}</p>}
      </div>

      {!cancelled && (
        <ol className="wb-steps mt-14" aria-label="Order progress">
          <li
            aria-hidden="true"
            className="wb-steps-fill"
            style={{ width: `${pos - 10}%`, transition: 'width .6s' }}
          />
          <li aria-hidden="true" className="contents">
            <CatSilhouette
              pose="walking"
              className="wb-steps-cat"
              style={{ left: `${pos}%`, transition: 'left .6s' }}
            />
          </li>
          {ORDER_STEPS.map((s, i) => {
            const state = i < current ? 'is-done' : i === current ? 'is-current' : '';
            return (
              <li key={s.key} className={`wb-step ${state}`} aria-current={i === current ? 'step' : undefined}>
                <span className="wb-step-dot">
                  {i < current && <img src={PAWS['paw-print']} alt="" />}
                </span>
                {s.label}
                {i < current && <span className="sr-only">, done</span>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
