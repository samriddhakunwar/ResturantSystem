# Chip

Small pill labels for dietary tags and item status, plus filter toggles for the menu.

| Class | Meaning | Colours |
|---|---|---|
| `wb-chip--veg` | veg / vegan, with a check icon | `olive-strong` on `olive-soft` |
| `wb-chip` | neutral facts (gluten-free, spicy) | `charcoal` on `cream` with a `line` border |
| `wb-chip--allergen` | allergen warning, with a warning icon | `danger` on `danger-soft` |
| `wb-chip--new` | new item | `ginger-ink` on `ginger-soft` |
| `wb-chip--pick` | a resident cat recommends it ("Momo's pick") | `on-olive` on `olive-strong` |

- The meaning is always in the word, never in the colour alone.
- Filter toggles are `<button class="wb-chip wb-chip-toggle" aria-pressed>`. They are 36px tall so they're easy to tap.
