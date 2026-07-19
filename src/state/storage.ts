import { STATE_VERSION } from "../data/catalog";
import type { PersistedState } from "../data/types";

/**
 * Client-side persistence for "Save my system for later".
 *
 * All access is guarded: private-browsing modes and disabled storage throw on
 * access, and we never want a storage failure to break the app.
 */

const STORAGE_KEY = "wyze.bundle.v1";

function getStore(): Storage | null {
  try {
    // Touch the API to surface a throw in restricted environments.
    const probe = "__wyze_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadState(): PersistedState | null {
  const store = getStore();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    // Ignore payloads from an incompatible schema.
    if (!parsed || parsed.version !== STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): boolean {
  const store = getStore();
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  const store = getStore();
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
}
