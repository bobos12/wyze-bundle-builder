import {
  catalog,
  DEFAULT_VARIANT,
  productsById,
  stepIdByProductId,
  variantKey,
} from "../data/catalog";
import type {
  PersistedState,
  Product,
  ReviewGroup,
  Variant,
} from "../data/types";

/**
 * Pure, memo-friendly derivations of the persisted configuration. Components
 * read exclusively through these, so the UI can never drift from the data.
 */

/** The variant currently bound to a product's stepper. */
export function activeVariantId(
  state: PersistedState,
  product: Product,
): string {
  const stored = state.activeVariant[product.id];
  if (stored) return stored;
  return product.variants?.[0]?.id ?? DEFAULT_VARIANT;
}

/** Quantity of one specific product+variant. */
export function variantQuantity(
  state: PersistedState,
  productId: string,
  variantId: string,
): number {
  return state.quantities[variantKey(productId, variantId)] ?? 0;
}

/** Total quantity of a product across every variant. */
export function productQuantity(
  state: PersistedState,
  productId: string,
): number {
  const product = productsById[productId];
  if (!product) return 0;
  if (!product.variants || product.variants.length === 0) {
    return variantQuantity(state, productId, DEFAULT_VARIANT);
  }
  return product.variants.reduce(
    (sum, v) => sum + variantQuantity(state, productId, v.id),
    0,
  );
}

/**
 * "N selected" for a step: the number of *distinct products* that have any
 * quantity, regardless of how many variants or units.
 */
export function stepSelectedCount(
  state: PersistedState,
  stepId: string,
): number {
  const step = catalog.steps.find((s) => s.id === stepId);
  if (!step) return 0;
  return step.products.reduce(
    (count, p) => count + (productQuantity(state, p.id) > 0 ? 1 : 0),
    0,
  );
}

export interface ReviewLine {
  key: string;
  productId: string;
  variantId: string;
  name: string;
  /** Shown only when a product contributes more than one variant line. */
  variantLabel?: string;
  image: string;
  qty: number;
  unitActive: number;
  unitCompareAt?: number;
  cadence: "once" | "monthly";
  /** Plans render without a stepper. */
  showStepper: boolean;
}

export interface ReviewGroupView {
  id: ReviewGroup;
  label: string;
  lines: ReviewLine[];
}

function variantImage(product: Product, variant?: Variant): string {
  return variant?.image ?? product.image;
}

/**
 * Every selected product+variant, grouped for the review panel. A product with
 * two coloured variants selected yields two independent lines.
 */
export function reviewGroups(state: PersistedState): ReviewGroupView[] {
  return catalog.reviewGroups
    .map(({ id, label }) => {
      const lines: ReviewLine[] = [];

      for (const step of catalog.steps) {
        for (const product of step.products) {
          if (product.reviewGroup !== id) continue;

          const variants: (Variant | undefined)[] =
            product.variants && product.variants.length > 0
              ? product.variants
              : [undefined];

          const productLines: ReviewLine[] = [];
          for (const variant of variants) {
            const variantId = variant?.id ?? DEFAULT_VARIANT;
            const qty = variantQuantity(state, product.id, variantId);
            if (qty <= 0) continue;
            productLines.push({
              key: variantKey(product.id, variantId),
              productId: product.id,
              variantId,
              name: product.name,
              variantLabel: variant?.label,
              image: variantImage(product, variant),
              qty,
              unitActive: product.price.active,
              unitCompareAt: product.price.compareAt,
              cadence: product.price.cadence ?? "once",
              showStepper: product.selectionMode !== "single",
            });
          }

          // Only disambiguate with the colour label when >1 line is present.
          if (productLines.length > 1) {
            lines.push(...productLines);
          } else if (productLines.length === 1) {
            lines.push({ ...productLines[0]!, variantLabel: undefined });
          }
        }
      }

      return { id, label, lines };
    })
    .filter((group) => group.lines.length > 0);
}

export interface Totals {
  /** Sum of compare-at (pre-discount) prices, one-time + first month of plan. */
  compareTotal: number;
  /** Sum of active prices — the headline total. */
  activeTotal: number;
  /** compareTotal - activeTotal. */
  savings: number;
  /** Indicative monthly financing figure (activeTotal / 12). */
  financingPerMonth: number;
}

/**
 * Bundle totals. Line prices are unit x quantity; the plan contributes a single
 * month. Free shipping is displayed but excluded from the money maths.
 */
export function totals(state: PersistedState): Totals {
  let compareTotal = 0;
  let activeTotal = 0;

  for (const [key, qty] of Object.entries(state.quantities)) {
    if (qty <= 0) continue;
    const productId = key.slice(0, key.lastIndexOf(":"));
    const product = productsById[productId];
    if (!product) continue;
    const unitActive = product.price.active;
    const unitCompare = product.price.compareAt ?? unitActive;
    activeTotal += unitActive * qty;
    compareTotal += unitCompare * qty;
  }

  const savings = Math.max(0, compareTotal - activeTotal);
  return {
    compareTotal,
    activeTotal,
    savings,
    financingPerMonth: Math.round(activeTotal / 12),
  };
}

/** Convenience: the step a product lives in (for stepper sync from review). */
export function stepOfProduct(productId: string): string | undefined {
  return stepIdByProductId[productId];
}
