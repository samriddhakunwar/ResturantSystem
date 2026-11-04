# CartBar

The floating pill pinned to the bottom of the QR menu. Tapping it opens the cart bottom sheet.

- Show it only when the cart has at least one item. Pin it 16px above the bottom safe area (`env(safe-area-inset-bottom)`).
- Write the count and total as "3 items · Rs. 850".
- The cart sheet itself is a `cream` panel with `radius-lg` top corners and `shadow-sheet`. Its final action is a full-width `wb-btn--primary wb-btn--block` labelled "Send to kitchen".
