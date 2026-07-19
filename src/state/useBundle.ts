import { useContext } from "react";

import { BundleContext, type BundleContextValue } from "./bundleContext";

/** Access the bundle configuration and dispatcher. */
export function useBundle(): BundleContextValue {
  const ctx = useContext(BundleContext);
  if (!ctx) {
    throw new Error("useBundle must be used within a <BundleProvider>.");
  }
  return ctx;
}
