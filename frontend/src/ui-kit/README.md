# Whisker & Brew UI kit

Copy this folder to `frontend/src/ui-kit/` (or `docs/ui-kit/`). `whisker.css` holds the fonts import, every token as a CSS variable, and all `wb-` component classes. Import it once after Tailwind. `components/*.md` are the usage rules for each component, and `assets/` holds the SVG cats, doodles, paws and social marks.

Whisker & Brew is a cat café. Its system has three parts: a mobile QR menu guests open at their table, public pages for the cats and for booking a visit, and a staff dashboard (POS, kitchen, billing). The look is warm cream paper, olive ink and one charcoal cat, with paw prints wandering across every surface. This book tells you how to build every screen of the café system from these tokens, components and assets.

## Voice and content

- **Tone:** warm, cosy and lightly playful. Cat puns belong in **names** only (Catpuccino, Purr-over Coffee, Whisker Waffles). Descriptions, prices, errors and instructions stay plain and exact.
  - Good: "Double shot, velvety foam and a cocoa paw on top."
  - Bad: "A purr-fectly paw-some cup of meow-gic!"
- **Casing:** sentence case everywhere. Button labels are written in sentence case and the CSS uppercases them ("BOOK A VISIT").
- **Voice:** speak to the guest as "you" and as the café say "we": "We'll bring it to Table 4."
- **No emoji** in the interface. The cat comes from the illustrations, not from 🐱.
- **Money:** NPR written `Rs. 280`, with no decimals unless there are paisa. Totals include VAT and service charge and say so.
- **Cat words**, one per screen at most and only beside a doodle: "meow", "purr" and "yawn", set in `script`. Sold out reads "Napping · sold out", empty cart reads "Your cart is having a nap", and a bad QR code reads "This table's QR is snoozing — please ask our staff."

## Colour

- `cream` is the ground for every page. `panel` boxes sit on it with `radius-lg` corners and no border and no shadow. That two-step cream → panel layering is the whole surface system.
- `olive` is the brand. Use it for cat silhouettes, doodles, dots, and display headings 24px+ on cream.
- For anything small, use `olive-strong`: button fills, labels, links, prices and chips. The kit's `olive` is only 3.74:1 on cream and 2.88:1 on panel, which is too low for small text. On panel, headings use `olive-dark`.
- `charcoal` is the text ink and the colour of the single hero cat. Use `ink-muted` for secondary text.
- `ginger`, `calico-brown`, `calico-tan` and `bean-pink` belong to the paw peeks and decorative blocks only. Ginger text is `ginger-ink`, on cream.
- State colours are always paired with a word or icon:
  - success / veg: `olive-strong` on `olive-soft`
  - new / attention: `ginger-ink` on `ginger-soft`
  - error / allergen: `danger` on `danger-soft`
  These three differ in lightness as well as hue.
- No gradients and no extra hues. The staff dashboard uses the same palette; there is no dark theme yet.

## Type

- **Display:** Bricolage Grotesque 800, for page titles (`display`), panel titles (`heading`) and the hero (`display-xl`). The kit's heading face wasn't named; Bricolage Grotesque is the closest Google Fonts match by eye. Swap it here if you have the original.
- **Body:** Quicksand. Use `body` (500) for text, `item-title` / `price` (700) for menu items, `label` (700, uppercase, +0.06em) for buttons and chips, and `state-label` (300) for the light captions above example groups.
- **Script:** Sacramento, for `script` words only. Never use it for information.
- Load all three from Google Fonts. `components/bundle.css` already imports them.
- Keep inputs at 16px so iOS doesn't zoom. Use tabular figures for prices and quantities.

## Spacing, radius, elevation

- Spacing runs on a 4px base, `space-1` to `space-7`.
  - Phones: 16px page gutter (`space-4`), 12px between cards (`space-3`), 24px panel padding (`space-5`), 32px between panels (`space-6`).
- Corner radius:
  - `radius-pill` for every button, chip, tab and slot
  - `radius-md` for cards
  - `radius-lg` for panels and sheets
  - `radius-sm` for inputs and images inside cards
- Surfaces are flat. `shadow-lift` appears only on a hovered button and the floating cart bar, and `shadow-sheet` only on bottom sheets.

## States and focus

- The kit's five button states apply to every control:
  - Default
  - Hover: grows 6% and lifts
  - Active: the selected one, with a fine 1.5px outline
  - Pressed: a deeper fill (`cream-pressed`, `olive-dark`)
  - Disabled: `disabled` fill with `disabled-ink`
- Keyboard focus everywhere is a 2px `cream` gap followed by a solid 2px `focus` (charcoal) ring, 9.27:1 on cream.
- Never remove focus styles. Respect `prefers-reduced-motion`: no grow, no sliding cat.

## Layout

- **Customer pages** are designed at 360px first and centred at max 480px on larger screens. The QR menu goes top to bottom:
  1. table header
  2. CatAvatarStrip
  3. sticky CategoryTabs
  4. MenuItemCards
  5. CartBar pinned to the bottom
- **Staff pages** use the existing sidebar layout with `cream` ground and `panel` cards. The kitchen board has one `panel` column per status.
- **Printed table tents** are A6, four per A4 sheet.

## Imagery and decoration

- **Cats:** the **Cats** asset group holds nine original silhouettes in `olive`: walking, sitting, stretching, pouncing, lying, grooming, tail-up and crouching, plus `cat-walking-charcoal` for the hero.
  - A screen gets one large cat at most, usually perched on the edge of a panel (see SectionPanel).
  - The silhouettes also serve as placeholders for missing cat photos and as the progress marker in OrderStatus.
- **Doodles:** line drawings in `olive` at a 2px stroke — steaming cup, leaf, toy mouse, yarn ball, fish bone, hearts — plus filled sparkle and dot. They decorate panel headers and empty states and stand in for missing menu photos. Never put them behind text.
- **Paws:**
  - `paw-trail` in `paw-faint`, or at 35% opacity, walks across page corners.
  - `paw-print` marks completed steps.
  - The three paw peeks reach in from the right edge on landing and confirmation screens only.
- **Recolouring:** every SVG has its ink baked in (`olive`, `charcoal` or the paw colours), because an `<img>` can't inherit `color`. To recolour one, inline it and change its `fill`/`stroke`, or apply it as a CSS `mask` over a token background colour (as SocialLinks does).
- **Real photos** of the cats and the food beat illustrations once they exist. Crop them 4:3 for cats and square for food, on `radius-md` / `radius-sm`.
- **No logo yet.** Set the café name in the display face, as on the cover and the TableTent. Don't draw a cat-head mark until the café commissions one.

## Iconography

- **UI icons:** `lucide-react`, which is already in the repo, at 20px with a 2px stroke, coloured `olive-strong` or `currentColor`. Examples: cart, search, bell, clock, check.
- **Social:** the real Facebook, Instagram and TikTok marks from Simple Icons 15.0.0 in the **Social** asset group, or `react-icons` (`FaFacebook`, `FaInstagram`, `FaTiktok`).
- Don't make icon-only buttons without an `aria-label`.

## Using this in the codebase (React + Tailwind)

1. Copy `components/bundle.css` into `frontend/src/styles/whisker.css` and import it once, after Tailwind. It contains the Google Fonts import and every `wb-` class.
2. Declare the tokens as CSS variables in `:root`. Use the token names exactly: `--cream`, `--olive-strong`, `--space-4`, `--radius-pill`, `--font-display`, …
3. Point Tailwind's theme at the variables so utility classes and the `wb-` classes share one source:

```js
// tailwind.config.js → theme.extend
colors: {
  cream: 'var(--cream)', panel: 'var(--panel)', olive: { DEFAULT: 'var(--olive)', strong: 'var(--olive-strong)', dark: 'var(--olive-dark)', soft: 'var(--olive-soft)' },
  charcoal: 'var(--charcoal)', muted: 'var(--ink-muted)', ginger: { DEFAULT: 'var(--ginger)', ink: 'var(--ginger-ink)', soft: 'var(--ginger-soft)' },
  danger: { DEFAULT: 'var(--danger)', soft: 'var(--danger-soft)' }, line: 'var(--line)',
},
fontFamily: { display: 'var(--font-display)', sans: 'var(--font-body)', script: 'var(--font-script)' },
borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', full: 'var(--radius-pill)' },
boxShadow: { lift: 'var(--shadow-lift)', sheet: 'var(--shadow-sheet)' },
```

4. Replace every `orange-*` class with the olive scale above, `bg-white` cards with `bg-panel`, and the `Inter` font with `font-sans` (Quicksand).
5. Download the SVGs from the asset groups into `frontend/src/assets/cats/`, `…/doodles/` and `…/paws/`.

## Intentional additions to the kit

The original kit covered buttons, social icons and decoration. To build the café system, these were added, each in the kit's style: SectionPanel, CategoryTabs, Chip, MenuItemCard, QuantityStepper, CartBar, OrderStatus, CatCard, CatAvatarStrip, SlotPicker, TextField, TableTent.

The colours `olive-strong`, `ink-muted`, `ginger-ink`, `olive-soft`, `ginger-soft`, `danger`, `danger-soft` and `line` were added so small text and states pass WCAG AA. Every other colour is sampled from the kit.
