import {
  catalog,
  DEFAULT_VARIANT,
  productsById,
  seedState,
  variantKey,
} from "../data/catalog";
import type { PersistedState } from "../data/types";

/**
 * All configuration mutations flow through this reducer. State is a plain,
 * serialisable object so it can be persisted and replayed verbatim, and every
 * derived view (counts, review lines, totals) is a pure function of it.
 */
export type BundleAction =
  | { type: "increment"; productId: string; variantId: string }
  | { type: "decrement"; productId: string; variantId: string }
  | { type: "setQuantity"; productId: string; variantId: string; qty: number }
  | { type: "setActiveVariant"; productId: string; variantId: string }
  | { type: "selectSingle"; stepId: string; productId: string }
  | { type: "toggleStep"; stepId: string }
  | { type: "openStep"; stepId: string }
  | { type: "reset" }
  | { type: "hydrate"; state: PersistedState };

const MAX_QTY = 99;

/** Minimum quantity for a product: 1 if required, else 0. */
function minQty(productId: string): number {
  return productsById[productId]?.required ? 1 : 0;
}

/** The variant the stepper is currently bound to, before any change. */
function activeVariantId(state: PersistedState, productId: string): string {
  return (
    state.activeVariant[productId] ??
    productsById[productId]?.variants?.[0]?.id ??
    DEFAULT_VARIANT
  );
}

function clampQty(productId: string, qty: number): number {
  return Math.max(minQty(productId), Math.min(MAX_QTY, Math.trunc(qty)));
}

function setQuantity(
  state: PersistedState,
  productId: string,
  variantId: string,
  qty: number,
): PersistedState {
  const key = variantKey(productId, variantId);
  const next = clampQty(productId, qty);
  const quantities = { ...state.quantities };
  if (next <= 0) {
    delete quantities[key];
  } else {
    quantities[key] = next;
  }
  return { ...state, quantities };
}

export function bundleReducer(
  state: PersistedState,
  action: BundleAction,
): PersistedState {
  switch (action.type) {
    case "increment": {
      const key = variantKey(action.productId, action.variantId);
      return setQuantity(
        state,
        action.productId,
        action.variantId,
        (state.quantities[key] ?? 0) + 1,
      );
    }

    case "decrement": {
      const key = variantKey(action.productId, action.variantId);
      return setQuantity(
        state,
        action.productId,
        action.variantId,
        (state.quantities[key] ?? 0) - 1,
      );
    }

    case "setQuantity":
      return setQuantity(state, action.productId, action.variantId, action.qty);

    case "setActiveVariant": {
      const activeVariant = {
        ...state.activeVariant,
        [action.productId]: action.variantId,
      };

      // Colour is an attribute of the shopper's selection, not a separate line:
      // recolouring carries the units across so the stepper keeps its count
      // instead of appearing to reset to zero. A destination that already holds
      // stock (only reachable from persisted state) absorbs them.
      const fromKey = variantKey(
        action.productId,
        activeVariantId(state, action.productId),
      );
      const toKey = variantKey(action.productId, action.variantId);
      const carried = state.quantities[fromKey] ?? 0;
      if (fromKey === toKey || carried <= 0) {
        return { ...state, activeVariant };
      }

      const quantities = { ...state.quantities };
      delete quantities[fromKey];
      quantities[toKey] = clampQty(
        action.productId,
        (state.quantities[toKey] ?? 0) + carried,
      );
      return { ...state, activeVariant, quantities };
    }

    case "selectSingle": {
      // Single-select step (e.g. plan): chosen product -> 1, siblings -> 0.
      const step = catalog.steps.find((s) => s.id === action.stepId);
      if (!step) return state;
      const quantities = { ...state.quantities };
      for (const product of step.products) {
        const key = variantKey(product.id, DEFAULT_VARIANT);
        if (product.id === action.productId) {
          quantities[key] = 1;
        } else {
          delete quantities[key];
        }
      }
      return { ...state, quantities };
    }

    case "toggleStep":
      return {
        ...state,
        openStepId: state.openStepId === action.stepId ? null : action.stepId,
      };

    case "openStep":
      return { ...state, openStepId: action.stepId };

    case "hydrate":
      return action.state;

    case "reset":
      return seedState;

    default:
      return state;
  }
}
