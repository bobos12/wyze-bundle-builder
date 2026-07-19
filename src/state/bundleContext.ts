import { createContext } from "react";

import type { PersistedState } from "../data/types";
import type { BundleAction } from "./bundleReducer";

export interface BundleContextValue {
  state: PersistedState;
  dispatch: React.Dispatch<BundleAction>;
  /** Force an immediate persist (used by "Save my system for later"). */
  save: () => boolean;
}

/**
 * The context object lives in its own module so the provider component and the
 * `useBundle` hook can each be the sole export of their file — a component file
 * that also exports non-components breaks React Fast Refresh.
 */
export const BundleContext = createContext<BundleContextValue | null>(null);
