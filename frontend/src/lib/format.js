// ─── Formatting helpers ───────────────────────────────────────────────────────
// Money is NPR written "Rs. 280": no decimals unless there are paisa.

export function formatRs(value) {
  const n = Number(value ?? 0);
  const hasPaisa = Math.round(n * 100) % 100 !== 0;
  return `Rs. ${n.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaisa ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** "3 items" / "1 item". */
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** A cat's age as the kit writes it: "2 yrs", "8 months", "1 yr 6 months". */
export function catAge(years = 0, months = 0) {
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months || !years) parts.push(plural(months, 'month'));
  return parts.join(' ');
}
