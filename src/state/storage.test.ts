import { afterEach, describe, expect, it, vi } from "vitest";

import { clearState, loadState, saveState } from "./storage";
import { STATE_VERSION } from "../data/catalog";
import type { PersistedState } from "../data/types";

const sample: PersistedState = {
  version: STATE_VERSION,
  openStepId: "cameras",
  quantities: { "cam-v4:white": 2 },
  activeVariant: { "cam-v4": "white" },
};

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("round trip", () => {
  it("restores exactly what was saved", () => {
    expect(saveState(sample)).toBe(true);
    expect(loadState()).toEqual(sample);
  });

  it("returns null when nothing is stored", () => {
    expect(loadState()).toBeNull();
  });

  it("clears the stored payload", () => {
    saveState(sample);
    clearState();
    expect(loadState()).toBeNull();
  });
});

describe("resilience", () => {
  it("ignores a payload from an older schema version", () => {
    saveState({ ...sample, version: STATE_VERSION + 1 });
    expect(loadState()).toBeNull();
  });

  it("returns null on malformed JSON instead of throwing", () => {
    window.localStorage.setItem("wyze.bundle.v1", "{ not json");
    expect(loadState()).toBeNull();
  });

  it("degrades gracefully when storage is unavailable", () => {
    // Private-browsing modes throw on write rather than failing silently.
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(saveState(sample)).toBe(false);
    expect(loadState()).toBeNull();
  });
});
