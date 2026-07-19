import { formatMoney } from "../../utils/format";
import styles from "./PriceTag.module.css";

interface PriceTagProps {
  active: number;
  compareAt?: number;
  cadence?: "once" | "monthly";
  /** Stack (cards, plan) or inline (compact rows). */
  layout?: "stack" | "inline";
  align?: "start" | "end";
  /** "lg" scales up on very large screens (the wide review-panel list). */
  size?: "md" | "lg";
}

function priceLabel(cents: number, cadence?: "once" | "monthly"): string {
  const suffix = cadence === "monthly" ? "/mo" : "";
  if (cents <= 0) return "FREE";
  return `${formatMoney(cents)}${suffix}`;
}

/**
 * Renders an active price with an optional struck-through compare-at price.
 * Handles "FREE" (active === 0) and monthly cadence. Shared by cards, review
 * lines and the shipping row so pricing always looks identical.
 */
export function PriceTag({
  active,
  compareAt,
  cadence,
  layout = "stack",
  align = "end",
  size = "md",
}: PriceTagProps) {
  const hasCompare = compareAt !== undefined && compareAt > active;
  return (
    <span
      className={`${styles.price} ${styles[layout]} ${styles[align]} ${size === "lg" ? styles.lg : ""}`}
      data-testid="price"
    >
      {hasCompare && (
        <span className={styles.compare}>
          {formatMoney(compareAt)}
          {cadence === "monthly" ? "/mo" : ""}
        </span>
      )}
      <span className={hasCompare ? styles.discounted : styles.active}>
        {priceLabel(active, cadence)}
      </span>
    </span>
  );
}
