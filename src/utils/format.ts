/** Formatting helpers. Money is stored as integer cents everywhere. */

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** `2798` -> `"$27.98"`. */
export function formatMoney(cents: number): string {
  return currency.format(cents / 100);
}

/**
 * Discount badge percentage. Uses floor to match the design's rounding
 * (e.g. a 12.5% saving renders as "Save 12%", not 13%).
 */
export function discountPercent(compareAt: number, active: number): number {
  if (compareAt <= 0 || active >= compareAt) return 0;
  return Math.floor(((compareAt - active) / compareAt) * 100);
}
