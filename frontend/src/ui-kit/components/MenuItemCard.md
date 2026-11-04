# MenuItemCard

One dish on the QR menu: image, name, description, tags, price and an add button.

**What you provide**
- `name`, `description` (one line, about 60 characters), `price` in NPR written `Rs. 280`, and `dietary_tags` rendered as Chips.
- An optional photo, filling the 96px square with `object-fit: cover`. Without one, a line doodle from the asset library is the placeholder.
- An optional `recommended_by` cat, shown as a `wb-chip--pick`.

**States**
- Available: an olive `+` button (`aria-label="Add Catpuccino"`).
- Sold out: add `is-soldout` to the card. The image dims, the name and price turn `ink-muted`, and the button becomes a "Napping · sold out" label in `ginger-ink`. Keep sold-out items visible rather than hiding them.

Cards stack with `space-3` gaps at full width on phones. On wider screens use a two-column grid.
