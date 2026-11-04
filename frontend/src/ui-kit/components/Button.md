# Button

Pill-shaped action button in two fills, **light** (cream) and **primary** (olive), with the kit's five states.

**When to use**
- `wb-btn--primary` for the one action a screen is for: "Send to kitchen", "Book a visit", "Confirm order". One per view.
- `wb-btn--light` for the secondary action beside it ("See the menu", "Order more"). The light fill is cream, so use it only on `panel` or over an image. On the cream page use `wb-btn--outline`, which has the same label colour plus an olive border.
- Labels are uppercase verbs of one to three words; CSS uppercases them, so write them in sentence case in code.

**States**
- Hover: grows 6% and lifts (`shadow-lift`).
- Active: the current or selected button (`aria-pressed="true"` or `aria-current`) gets a 1.5px outline.
- Pressed (`:active`): `cream-pressed` or `olive-dark` fill.
- Disabled: `disabled` fill with `disabled-ink` label.
- Keyboard focus is the shared ring: a 2px cream gap, then 2px `focus`.
- With `prefers-reduced-motion` the button doesn't grow.

**What you provide**
A `<button>` (or `<a>` for navigation) with `class="wb-btn wb-btn--primary|light|outline"`. Optional modifiers: `wb-btn--sm` (36px tall, for dense staff screens) and `wb-btn--block` (full width, for the mobile cart).

**Accessibility change from the kit:** the kit's olive is 3.74:1 against cream, which is too low for the 13px label. Buttons therefore use `olive-strong` (5.95:1). `olive` stays for large shapes and display headings.
