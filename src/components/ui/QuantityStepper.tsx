import { MinusIcon, PlusIcon } from "../icons";
import styles from "./QuantityStepper.module.css";

interface QuantityStepperProps {
  quantity: number;
  /** Lower bound (1 for required items, else 0). */
  min?: number;
  /** Accessible noun, e.g. "Wyze Cam v4 (White)". */
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "md" | "sm";
}

/**
 * A minus / value / plus stepper. Used identically on product cards and in the
 * review panel; both are driven by the same shared state, so they stay in sync
 * automatically.
 */
export function QuantityStepper({
  quantity,
  min = 0,
  label,
  onIncrement,
  onDecrement,
  size = "md",
}: QuantityStepperProps) {
  const canDecrement = quantity > min;

  return (
    <div
      className={`${styles.stepper} ${size === "sm" ? styles.sm : ""}`}
      role="group"
      aria-label={`Quantity for ${label}`}
    >
      <button
        type="button"
        className={styles.btn}
        onClick={onDecrement}
        disabled={!canDecrement}
        aria-label={`Decrease quantity of ${label}`}
      >
        <MinusIcon className={styles.glyph} aria-hidden="true" />
      </button>
      <span className={styles.value} aria-live="polite" aria-atomic="true">
        {quantity}
      </span>
      <button
        type="button"
        className={`${styles.btn} ${styles.add}`}
        onClick={onIncrement}
        aria-label={`Increase quantity of ${label}`}
      >
        <PlusIcon className={styles.glyph} aria-hidden="true" />
      </button>
    </div>
  );
}
