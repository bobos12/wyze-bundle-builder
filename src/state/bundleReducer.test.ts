import { describe, expect, it } from "vitest";

import { bundleReducer, type BundleAction } from "./bundleReducer";
import { seedState, variantKey } from "../data/catalog";
import type { PersistedState } from "../data/types";

/** A deliberately empty configuration, so each test states its own premise. */
const empty: PersistedState = {
  version: 1,
  openStepId: null,
  quantities: {},
  activeVariant: {},
};

/** Apply a sequence of actions, mirroring how the UI drives the reducer. */
function run(state: PersistedState, ...actions: BundleAction[]): PersistedState {
  return actions.reduce(bundleReducer, state);
}

describe("quantities", () => {
  it("increments from absent to 1", () => {
    const next = run(empty, {
      type: "increment",
      productId: "cam-v4",
      variantId: "white",
    });
    expect(next.quantities[variantKey("cam-v4", "white")]).toBe(1);
  });

  it("removes the key entirely when a quantity reaches zero", () => {
    const key = variantKey("cam-v4", "white");
    const next = run(
      empty,
      { type: "increment", productId: "cam-v4", variantId: "white" },
      { type: "decrement", productId: "cam-v4", variantId: "white" },
    );
    // Absent rather than 0 — totals and counts iterate the map directly, so a
    // lingering zero would show up as a phantom line in the review panel.
    expect(next.quantities).not.toHaveProperty(key);
  });

  it("does not go negative when decrementing an unselected product", () => {
    const next = run(empty, {
      type: "decrement",
      productId: "cam-v4",
      variantId: "white",
    });
    expect(next.quantities).toEqual({});
  });

  it("holds a required product at a minimum of 1", () => {
    const key = variantKey("sense-hub", "default");
    const next = run(
      { ...empty, quantities: { [key]: 1 } },
      { type: "decrement", productId: "sense-hub", variantId: "default" },
    );
    expect(next.quantities[key]).toBe(1);
  });

  it("clamps setQuantity to the 99 ceiling", () => {
    const next = run(empty, {
      type: "setQuantity",
      productId: "cam-v4",
      variantId: "white",
      qty: 500,
    });
    expect(next.quantities[variantKey("cam-v4", "white")]).toBe(99);
  });

  it("tracks each variant of a product independently", () => {
    const next = run(
      empty,
      { type: "increment", productId: "cam-v4", variantId: "white" },
      { type: "increment", productId: "cam-v4", variantId: "black" },
      { type: "increment", productId: "cam-v4", variantId: "black" },
    );
    expect(next.quantities[variantKey("cam-v4", "white")]).toBe(1);
    expect(next.quantities[variantKey("cam-v4", "black")]).toBe(2);
  });
});

describe("single-select steps", () => {
  it("clears sibling products when a plan is chosen", () => {
    const withNoPlan = run(empty, {
      type: "selectSingle",
      stepId: "plan",
      productId: "no-plan",
    });
    expect(withNoPlan.quantities[variantKey("no-plan", "default")]).toBe(1);

    const switched = run(withNoPlan, {
      type: "selectSingle",
      stepId: "plan",
      productId: "cam-unlimited",
    });
    expect(switched.quantities[variantKey("cam-unlimited", "default")]).toBe(1);
    expect(switched.quantities).not.toHaveProperty(
      variantKey("no-plan", "default"),
    );
  });

  it("ignores an unknown step id", () => {
    const next = run(empty, {
      type: "selectSingle",
      stepId: "nope",
      productId: "cam-unlimited",
    });
    expect(next).toBe(empty);
  });
});

describe("accordion", () => {
  it("collapses the step that is already open", () => {
    const next = run({ ...empty, openStepId: "cameras" }, {
      type: "toggleStep",
      stepId: "cameras",
    });
    expect(next.openStepId).toBeNull();
  });

  it("switches directly between steps", () => {
    const next = run({ ...empty, openStepId: "cameras" }, {
      type: "toggleStep",
      stepId: "sensors",
    });
    expect(next.openStepId).toBe("sensors");
  });
});

describe("changing colour", () => {
  it("carries the quantity over so the stepper does not appear to reset", () => {
    // Mirrors the UI: the stepper only ever edits the active variant.
    const next = run(
      empty,
      { type: "setActiveVariant", productId: "cam-v4", variantId: "black" },
      { type: "increment", productId: "cam-v4", variantId: "black" },
      { type: "increment", productId: "cam-v4", variantId: "black" },
      { type: "setActiveVariant", productId: "cam-v4", variantId: "white" },
    );
    expect(next.quantities).toEqual({ [variantKey("cam-v4", "white")]: 2 });
    expect(next.activeVariant["cam-v4"]).toBe("white");
  });

  it("merges into a colour that already holds stock", () => {
    const next = run(
      {
        ...empty,
        quantities: {
          [variantKey("cam-v4", "black")]: 2,
          [variantKey("cam-v4", "white")]: 1,
        },
        activeVariant: { "cam-v4": "black" },
      },
      { type: "setActiveVariant", productId: "cam-v4", variantId: "white" },
    );
    expect(next.quantities).toEqual({ [variantKey("cam-v4", "white")]: 3 });
  });

  it("is a no-op on quantities when nothing is selected yet", () => {
    const next = run(empty, {
      type: "setActiveVariant",
      productId: "cam-v4",
      variantId: "white",
    });
    expect(next.quantities).toEqual({});
    expect(next.activeVariant["cam-v4"]).toBe("white");
  });
});

describe("immutability", () => {
  it("never mutates the state it is given", () => {
    const before = JSON.stringify(seedState);
    run(
      seedState,
      { type: "increment", productId: "cam-v4", variantId: "black" },
      { type: "setActiveVariant", productId: "cam-v4", variantId: "black" },
      { type: "toggleStep", stepId: "sensors" },
    );
    expect(JSON.stringify(seedState)).toBe(before);
  });
});

describe("reset and hydrate", () => {
  it("reset returns the seeded configuration", () => {
    const dirty = run(empty, {
      type: "increment",
      productId: "keypad",
      variantId: "default",
    });
    expect(bundleReducer(dirty, { type: "reset" })).toEqual(seedState);
  });

  it("hydrate replaces state wholesale", () => {
    const restored: PersistedState = {
      version: 1,
      openStepId: "plan",
      quantities: { "keypad:default": 3 },
      activeVariant: {},
    };
    expect(bundleReducer(seedState, { type: "hydrate", state: restored })).toEqual(
      restored,
    );
  });
});
