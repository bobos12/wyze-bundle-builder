import { describe, expect, it } from "vitest";

import {
  activeVariantId,
  productQuantity,
  reviewGroups,
  stepSelectedCount,
  totals,
  variantQuantity,
} from "./selectors";
import { productsById, seedState } from "../data/catalog";
import type { PersistedState } from "../data/types";

const empty: PersistedState = {
  version: 1,
  openStepId: null,
  quantities: {},
  activeVariant: {},
};

function withQuantities(quantities: Record<string, number>): PersistedState {
  return { ...empty, quantities };
}

describe("activeVariantId", () => {
  it("falls back to the first variant when none is stored", () => {
    const camV4 = productsById["cam-v4"]!;
    expect(activeVariantId(empty, camV4)).toBe("white");
  });

  it("returns the stored variant when one is set", () => {
    const camV4 = productsById["cam-v4"]!;
    const state = { ...empty, activeVariant: { "cam-v4": "black" } };
    expect(activeVariantId(state, camV4)).toBe("black");
  });

  it("uses the default sentinel for a product with no variants", () => {
    const keypad = productsById["keypad"]!;
    expect(activeVariantId(empty, keypad)).toBe("default");
  });
});

describe("productQuantity", () => {
  it("sums across every variant of a product", () => {
    const state = withQuantities({ "cam-v4:white": 1, "cam-v4:black": 2 });
    expect(productQuantity(state, "cam-v4")).toBe(3);
    expect(variantQuantity(state, "cam-v4", "white")).toBe(1);
  });

  it("returns 0 for an unknown product", () => {
    expect(productQuantity(empty, "does-not-exist")).toBe(0);
  });
});

describe("stepSelectedCount", () => {
  it("counts distinct products, not units or variants", () => {
    // Three units of one product across two colours is still "1 selected".
    const state = withQuantities({ "cam-v4:white": 1, "cam-v4:black": 2 });
    expect(stepSelectedCount(state, "cameras")).toBe(1);
  });

  it("counts each distinct product once", () => {
    const state = withQuantities({ "cam-v4:white": 1, "doorbell:default": 1 });
    expect(stepSelectedCount(state, "cameras")).toBe(2);
  });

  it("returns 0 for an unknown step", () => {
    expect(stepSelectedCount(seedState, "nope")).toBe(0);
  });
});

describe("totals", () => {
  it("multiplies unit price by quantity", () => {
    // motion-sensor is 2999 with no compareAt.
    const state = withQuantities({ "motion-sensor:default": 3 });
    const t = totals(state);
    expect(t.activeTotal).toBe(2999 * 3);
    expect(t.compareTotal).toBe(2999 * 3);
    expect(t.savings).toBe(0);
  });

  it("derives savings from the compare-at price", () => {
    // cam-v4 is 2798 active / 3598 compareAt.
    const state = withQuantities({ "cam-v4:white": 2 });
    const t = totals(state);
    expect(t.activeTotal).toBe(2798 * 2);
    expect(t.compareTotal).toBe(3598 * 2);
    expect(t.savings).toBe((3598 - 2798) * 2);
  });

  it("treats a free item as zero cost but keeps its compare-at savings", () => {
    // sense-hub is 0 active / 2992 compareAt.
    const t = totals(withQuantities({ "sense-hub:default": 1 }));
    expect(t.activeTotal).toBe(0);
    expect(t.savings).toBe(2992);
  });

  it("parses variant keys containing a colon correctly", () => {
    // The product id is split on the LAST colon, so this must resolve to cam-v4.
    expect(totals(withQuantities({ "cam-v4:white": 1 })).activeTotal).toBe(2798);
  });

  it("ignores unknown products rather than throwing", () => {
    expect(totals(withQuantities({ "ghost:default": 5 })).activeTotal).toBe(0);
  });

  it("is zero for an empty bundle", () => {
    expect(totals(empty)).toEqual({
      compareTotal: 0,
      activeTotal: 0,
      savings: 0,
      financingPerMonth: 0,
    });
  });

  it("computes financing as one twelfth of the active total", () => {
    const t = totals(withQuantities({ "motion-sensor:default": 4 }));
    expect(t.financingPerMonth).toBe(Math.round((2999 * 4) / 12));
  });
});

describe("reviewGroups", () => {
  it("omits groups that have no selected lines", () => {
    const groups = reviewGroups(withQuantities({ "cam-v4:white": 1 }));
    expect(groups.map((g) => g.id)).toEqual(["cameras"]);
  });

  it("emits one line per selected variant and labels them", () => {
    const groups = reviewGroups(
      withQuantities({ "cam-v4:white": 1, "cam-v4:black": 2 }),
    );
    const lines = groups[0]!.lines;
    expect(lines).toHaveLength(2);
    expect(lines.map((l) => l.variantLabel)).toEqual(["White", "Black"]);
  });

  it("drops the variant label when only one variant is selected", () => {
    const groups = reviewGroups(withQuantities({ "cam-v4:white": 1 }));
    expect(groups[0]!.lines[0]!.variantLabel).toBeUndefined();
  });

  it("marks plans as non-steppable", () => {
    const groups = reviewGroups(withQuantities({ "cam-unlimited:default": 1 }));
    const planLine = groups.find((g) => g.id === "plan")!.lines[0]!;
    expect(planLine.showStepper).toBe(false);
    expect(planLine.cadence).toBe("monthly");
  });

  it("keeps quantity products steppable", () => {
    const groups = reviewGroups(withQuantities({ "keypad:default": 1 }));
    expect(groups[0]!.lines[0]!.showStepper).toBe(true);
  });
});

describe("seed state", () => {
  it("matches the configuration the design mockup shows", () => {
    expect(stepSelectedCount(seedState, "cameras")).toBe(2);
    expect(productQuantity(seedState, "cam-pan-v3")).toBe(2);
    expect(totals(seedState).activeTotal).toBeGreaterThan(0);
  });
});
