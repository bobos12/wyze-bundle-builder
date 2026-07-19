import { useRef } from "react";
import type { Variant } from "../../data/types";
import { asset } from "../../utils/asset";
import styles from "./VariantSelector.module.css";

interface VariantSelectorProps {
  productName: string;
  variants: Variant[];
  activeVariantId: string;
  /** Fallback thumbnail when a variant has no photo of its own. */
  productImage: string;
  /** Whether a given variant currently has a quantity above zero. */
  isSelected: (variantId: string) => boolean;
  onSelect: (variantId: string) => void;
}

/**
 * A radiogroup of colour chips, each showing a product photo thumbnail (the
 * variant's own image if it has one, else the product's default image).
 * Selecting a chip makes it the *active* variant — the one the card's
 * stepper reads and edits — without touching any other variant's quantity.
 */
export function VariantSelector({
  productName,
  variants,
  activeVariantId,
  productImage,
  isSelected,
  onSelect,
}: VariantSelectorProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const last = variants.length - 1;
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else return;
    event.preventDefault();
    const variant = variants[next];
    if (!variant) return;
    onSelect(variant.id);
    refs.current[next]?.focus();
  }

  return (
    <div
      className={styles.group}
      role="radiogroup"
      aria-label={`Colour for ${productName}`}
    >
      {variants.map((variant, index) => {
        const isActive = variant.id === activeVariantId;
        const highlighted = isActive && isSelected(variant.id);
        return (
          <button
            key={variant.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`${styles.chip} ${highlighted ? styles.highlighted : ""}`}
            onClick={() => onSelect(variant.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <img
              className={styles.swatch}
              src={asset(variant.image ?? productImage)}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
            <span className={styles.label}>{variant.label}</span>
          </button>
        );
      })}
    </div>
  );
}
