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

    case "setActiveVariant":
      return {
        ...state,
        activeVariant: {
          ...state.activeVariant,
          [action.productId]: action.variantId,
        },
      };

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
