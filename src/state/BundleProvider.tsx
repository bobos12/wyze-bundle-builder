import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

import { seedState } from "../data/catalog";
import type { PersistedState } from "../data/types";
import { BundleContext, type BundleContextValue } from "./bundleContext";
import { bundleReducer } from "./bundleReducer";
import { loadState, saveState } from "./storage";

/** Restore a saved system on first render, else fall back to the seed. */
function initState(): PersistedState {
  return loadState() ?? seedState;
}

export function BundleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bundleReducer, undefined, initState);

  // Auto-persist so a configuration is never lost between visits. Skip the
  // very first run so we don't immediately rewrite what we just restored.
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    saveState(state);
  }, [state]);

  const save = useCallback(() => saveState(state), [state]);

  const value = useMemo<BundleContextValue>(
    () => ({ state, dispatch, save }),
    [state, save],
  );

  return (
    <BundleContext.Provider value={value}>{children}</BundleContext.Provider>
  );
}
