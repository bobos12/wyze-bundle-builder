import rawCatalog from "./catalog.json";
import type { Catalog, PersistedState, Product } from "./types";

/**
 * The catalog is authored as JSON (see `catalog.json`) and typed on import.
 * Serving this from a small API instead would be a drop-in change — every
 * consumer depends only on the `Catalog` shape, not on the import mechanism.
 */
export const catalog = rawCatalog as Catalog;

/** Current persisted-state schema version. Bump to invalidate old payloads. */
export const STATE_VERSION = 1;

/** Sentinel variant id used for products that have no colour options. */
export const DEFAULT_VARIANT = "default";

/** Build the stable selection key for a product + variant pair. */
export function variantKey(productId: string, variantId: string): string {
  return `${productId}:${variantId}`;
}

/** Flat lookup of every product by id, memoised at module load. */
export const productsById: Record<string, Product> = Object.fromEntries(
  catalog.steps.flatMap((step) => step.products).map((p) => [p.id, p]),
);

/** The step id a product belongs to (used to compute per-step counts). */
export const stepIdByProductId: Record<string, string> = Object.fromEntries(
  catalog.steps.flatMap((step) =>
    step.products.map((p) => [p.id, step.id] as const),
  ),
);

/**
 * The seeded configuration. Chosen so the app loads pixel-matching the Figma:
 * Cam v4 ×1 (White), Cam Pan v3 ×2 (White), Motion Sensor ×2, Sense Hub ×1,
 * MicroSD ×2, and the Cam Unlimited plan selected. Step 1 is open.
 */
export const seedState: PersistedState = {
  version: STATE_VERSION,
  openStepId: "cameras",
  quantities: {
    "cam-v4:white": 1,
    "cam-pan-v3:white": 2,
    "motion-sensor:default": 2,
    "sense-hub:default": 1,
    "microsd:default": 2,
    "cam-unlimited:default": 1,
  },
  activeVariant: {
    "cam-v4": "white",
    "cam-pan-v3": "white",
    "floodlight-v2": "white",
    "battery-cam-pro": "white",
  },
};
