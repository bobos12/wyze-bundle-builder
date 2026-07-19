/**
 * Domain types for the bundle builder.
 *
 * The whole experience is data-driven: the catalog (see `catalog.json`) is the
 * single source of truth for what renders, and the runtime configuration is a
 * flat map of quantities keyed by a stable variant key. Nothing about a specific
 * product is hard-coded in the components.
 */

/** A selectable colour/finish of a product. */
export interface Variant {
  /** Stable id, unique within its product (e.g. "white"). */
  id: string;
  /** Human label shown on the chip (e.g. "White"). */
  label: string;
  /** Hex swatch used for the chip dot when no thumbnail is available. */
  swatch: string;
  /** Optional per-variant image; falls back to the product image. */
  image?: string;
}

/** Pricing for one unit of a product. All values are in whole cents. */
export interface Price {
  /** Optional "compare at" price, shown struck through. */
  compareAt?: number;
  /** The active price the shopper pays. `0` renders as "FREE". */
  active: number;
  /** Monthly (subscription) pricing renders as "/mo" and is billed once in the bundle total. */
  cadence?: "once" | "monthly";
}

/** How a product participates in selection. */
export type SelectionMode =
  /** Cameras, sensors, accessories: quantity 0..n via a stepper. */
  | "quantity"
  /** Plans: single-select within the step; quantity is implicitly 1. */
  | "single";

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Main product image (path under /public). */
  image: string;
  price: Price;
  selectionMode: SelectionMode;
  variants?: Variant[];
  /** Required items cannot be reduced below 1 (e.g. the Sense Hub). */
  required?: boolean;
  /** Which review-panel group this product is summarised under. */
  reviewGroup: ReviewGroup;
}

export type ReviewGroup = "cameras" | "sensors" | "accessories" | "plan";

export interface Step {
  id: string;
  /** "STEP 1 OF 4" ordinal is derived from array position. */
  title: string;
  /** Icon key resolved by the icon registry. */
  icon: IconKey;
  products: Product[];
}

export type IconKey = "camera" | "shield" | "sensor" | "protection";

export interface Catalog {
  steps: Step[];
  /** Review-panel group order + display labels. */
  reviewGroups: { id: ReviewGroup; label: string }[];
  /** Static rows the review panel always shows. */
  shipping: { label: string; compareAt: number; active: number };
  guarantee: {
    days: number;
    label: string;
    /** Heading + body shown alongside the seal on wide layouts. */
    returnsHeading: string;
    returnsBody: string;
  };
  financing: { label: string };
}

/**
 * Runtime selection. Keyed by `${productId}:${variantId}` (variantId is
 * "default" for products with no variants). Value is the quantity.
 *
 * This shape is intentionally flat and serialisable so it drops straight into
 * localStorage and every derived view (counts, review lines, totals) is a pure
 * function of it.
 */
export type Quantities = Record<string, number>;

/** UI state that is also persisted so a return visit is fully restored. */
export interface PersistedState {
  quantities: Quantities;
  /** The variant currently bound to each product's stepper. */
  activeVariant: Record<string, string>;
  /** Which step is expanded (single-open accordion). */
  openStepId: string | null;
  /** Schema version, so we can migrate/ignore stale payloads. */
  version: number;
}
