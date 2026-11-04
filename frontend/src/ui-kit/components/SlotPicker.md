# SlotPicker

The time-slot pills on the "Book a visit" page. Each shows a start time and how many places are left.

- Choosing a slot sets `aria-pressed="true"`, which fills it `olive-strong`. Only one slot can be chosen at a time.
- Full slots are `disabled`: `panel` fill, struck through, and still visible so guests can see the day's shape.
- Write the remaining count as "3 spots", or "Full" when none are left. The data comes from `GET /api/v1/public/bookings/available-slots/?date=`.
- Below the slots come party size (QuantityStepper), the cafe rules checkbox (TextField) and the primary "Book a visit" button.
