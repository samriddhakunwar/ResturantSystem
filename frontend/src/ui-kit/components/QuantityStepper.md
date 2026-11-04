# QuantityStepper

A minus/plus pill for changing quantities in the cart sheet.

- Each button is 32px with a 4px pad, which gives roughly a 40px tap area.
- At quantity 1 the minus button removes the line, so its `aria-label` changes to "Remove".
- Cap quantities at 20 per line to match the server-side limit.
- You provide the value and the `onChange` handler. Give the group an `aria-label` that names the item.
