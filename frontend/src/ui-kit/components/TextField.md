# TextField

Text inputs, textareas and the café-rules checkbox, used on the booking and adoption forms and for cart notes.

- The label always sits above the input and is never a placeholder; placeholders only give an example ("Less sugar, please").
- Inputs are 48px tall with a 1.5px `olive` border on `cream` (3.74:1, which passes for control borders) and `radius-sm` corners. Text is 16px so iOS doesn't zoom in.
- **Error:** add `is-error` to the field. The border turns `danger`, and a message with a warning icon appears below, linked to the input by `aria-describedby`. Set `aria-invalid="true"` on the input.
- **Checkbox:** `wb-check`, a 22px box in `olive-strong`. The rules text is the label itself, so tapping the text ticks the box.
