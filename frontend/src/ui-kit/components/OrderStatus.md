# OrderStatus

A five-step progress line on the guest's order page: Received → Confirmed → Brewing → Ready → Served.

- Completed steps show a filled `olive-strong` dot with a white paw print. The current step has an olive ring and bold `charcoal` text. Later steps are `line` and `ink-muted`.
- The walking cat sits above the current step. You can slide it between steps with `transition: left .6s`; skip the slide under `prefers-reduced-motion`.
- Put the current step in words in the heading too ("Your order is brewing"), and update it inside an `aria-live="polite"` region so screen readers announce changes.
- You provide the current status from `GET /api/v1/public/orders/{public_id}/` (poll every 5s). Show "Call staff", "Request bill" and "Order more" as light or outline buttons below it.
