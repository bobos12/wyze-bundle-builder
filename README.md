# Security System Bundle Builder

A multi-step bundle builder with a live review panel, built as a React
prototype from the provided Figma design. The shopper assembles a system
through a four-step accordion (cameras → plan → sensors → extra protection)
while a summary panel recalculates in real time beside it.

Built with **React 18 + TypeScript + Vite**, styled with **CSS Modules** and
CSS custom properties. No UI framework — every component and token is
hand-built to match the design.

The source Figma frame this was built against is checked in at
[`docs/design-reference.png`](docs/design-reference.png) for side-by-side comparison.

---

## For reviewers — start here

```bash
npm install && npm run dev
```

Then, if you want the 60-second tour of the parts worth looking at:

| What | Where |
|---|---|
| All state transitions (pure, tested) | [`src/state/bundleReducer.ts`](src/state/bundleReducer.ts) |
| All derived values (pure, tested) | [`src/state/selectors.ts`](src/state/selectors.ts) |
| The entire product catalog — no markup per product | [`src/data/catalog.json`](src/data/catalog.json) |
| The trickiest behaviour (per-variant quantities) | [Variants](#variants-the-interesting-part), below |
| Judgement calls I had to make | [Decisions & trade-offs](#decisions--trade-offs), below |

`npm run lint`, `npm run build`, and `npm test` (40 tests) all pass clean from a
fresh clone.

---

## Run it

Requires Node 18+.

```bash
npm install
npm run dev      # start the dev server (Vite prints the local URL)
```

Other scripts:

```bash
npm run build      # type-check (tsc --noEmit) then produce a production build
npm run preview    # serve the production build locally
npm run lint       # eslint (zero warnings tolerated)
npm test           # run the unit suite once
npm run test:watch # re-run on change
```

The app builds and runs from a clean clone with no additional setup.

---

## How it works

### Data-driven

Everything renders from a single JSON catalog: [`src/data/catalog.json`](src/data/catalog.json).
There is no per-product markup anywhere in the components — add a product to the
JSON and it appears, badge/variants/pricing and all. The catalog is typed on
import ([`src/data/types.ts`](src/data/types.ts)), so the data and the UI can't
drift. Serving this JSON from an API instead would be a one-line change, since
every consumer depends only on the `Catalog` type.

### State

All configuration lives in one small, serialisable object (a map of
`productId:variantId → quantity`, plus the active variant per product and the
open step). It flows through a reducer
([`src/state/bundleReducer.ts`](src/state/bundleReducer.ts)); every derived
view — the "N selected" counts, the review lines, the totals — is a **pure
selector** over that state ([`src/state/selectors.ts`](src/state/selectors.ts)).
Because the product cards and the review panel read and write the *same* state,
the two steppers for any item stay in sync automatically.

### Variants (the interesting part)

Each variant has its own quantity, tracked under a separate key. The card's
stepper is bound to whichever variant is currently **active**: select Red, add
2, switch to Blue, and the stepper reads 0 while the 2 Red are untouched. The
review panel lists **every** variant with a quantity above zero as its own line,
so switching the card's colour never removes another colour from the summary.
(Per the brief, the active-chip highlight is intentionally light-touch — the
focus is the selection-and-quantity behaviour flowing through to the review.)

### Persistence — "Save my system for later"

The configuration is persisted to `localStorage`
([`src/state/storage.ts`](src/state/storage.ts)) and restored on load, so
building a system, leaving, and returning brings it back exactly. Saving is
**automatic** on every change (so nothing is ever lost); the *Save my system for
later* link forces an immediate write and confirms with a "Saved ✓". Storage
access is fully guarded, so private-browsing modes degrade gracefully rather
than throwing. A schema `version` invalidates incompatible payloads.

### Accessibility

Accordion headers are real buttons with `aria-expanded`/`aria-controls`;
collapsed panels are marked `inert` so hidden controls stay out of the tab
order. The variant chips are a keyboard-navigable `radiogroup` (arrow keys +
roving tabindex). Steppers are labelled button groups that disable at their
lower bound. Focus is always visible, images have alt text, decorative icons are
`aria-hidden`, and `prefers-reduced-motion` is respected.

### Responsiveness

Desktop matches the Figma two-column layout (sticky review panel). Below
~980px the review panel stacks beneath the builder; the card grid drops from
two columns to one on narrow builders; type and media scale down for phones.
The layout stays usable and coherent down to small mobile widths.

---

## Decisions & trade-offs

**Pricing model / a mock inconsistency.** The brief requires the total to
recalculate from quantities, so pricing is computed from a single unit price per
product (compare-at + active), with review line prices shown as unit × quantity.
The builder cards and the review panel in the Figma disagree on one product
(Wyze Cam Pan v3: the card shows \$39.98→\$34.98, which matches its "Save 12%"
badge exactly, while the review panel's line implies a different unit price). I
treated the **builder cards as the source of truth**, since their prices are
per-unit and mathematically consistent with the discount badges. With that
model the seeded **savings land on \$50.92 — exactly matching the design** — and
all discounts stay internally consistent; the only figure that differs from the
static mock is the headline total, because the mock's Pan v3 review line isn't
consistent with its own card.

**Product images.** The five cameras plus the motion sensor, Sense Hub and
microSD card use the **original product photography from the Figma file**
([`public/products/*.jpg`](public/products)). The plan (shield) and the two
products the Figma only lists but never pictures (entry sensor, keypad) use small
on-brand **SVG** marks. Every colour variant reuses its product's photo, matching
the design (the variant chips there show the same shot); the coloured swatch on
the chip conveys the finish. `ProductImage` renders a graceful placeholder if any
asset ever fails to load, so there's never a broken image or layout shift.

**Font.** The design uses Gilroy, which is commercial. **Manrope** (Google
Fonts) is loaded as a close, freely-licensed geometric substitute; the
`font-family` stack lists Gilroy first, so it's used automatically wherever it's
installed.

**Steps 2–4 content.** The Figma only shows these steps collapsed, so their
product lists are a reasonable extrapolation consistent with the review panel's
seeded items (the plan, sensors and accessory) and the Wyze product line. The
seeded state reproduces the review panel exactly as designed.

---

## Project structure

```
src/
  data/            catalog.json + types + typed loader & seed state
  state/           bundleReducer   pure state transitions (+ tests)
                   selectors       pure derivations: counts, lines, totals (+ tests)
                   storage         guarded localStorage round-trip (+ tests)
                   bundleContext   the context object
                   BundleProvider  wiring: reducer + auto-persist
                   useBundle       consumer hook
  components/
    builder/       Accordion → Step → StepHeader / ProductCard / ProductImage
    review/        ReviewPanel → ReviewLine / ReviewSummary
    ui/            Reusable primitives: QuantityStepper, VariantSelector,
                   Badge, PriceTag
    icons/         Inline SVG controls + the keyed step-icon registry
  test/            Vitest setup
  utils/           money & discount formatting

public/
  products/        product photography
  icons/           brand marks & UI glyphs shipped as files

docs/
  design-reference.png   the source Figma frame, for comparison
```

The context is split across three small modules (`bundleContext` / `BundleProvider`
/ `useBundle`) so no file exports both a component and a non-component — that
combination silently breaks React Fast Refresh, and the lint config treats it as
an error.

---

## Tests

40 unit tests (Vitest) cover the layer where the logic actually lives — the pure
reducer and selectors, plus persistence:

- **`bundleReducer`** — quantity clamping (zero-floor, the 99 ceiling, required
  items pinned at 1), keys being *deleted* rather than left at `0`, per-variant
  independence, single-select plan swapping, accordion toggling, and that state
  is never mutated in place.
- **`selectors`** — variant fallback, "N selected" counting distinct products
  rather than units, line-price maths, compare-at savings, variant-key parsing,
  review-line grouping and label suppression, and unknown-product safety.
- **`storage`** — round-trip, schema-version invalidation, malformed JSON, and
  graceful degradation when `localStorage` throws (private browsing).

```bash
npm test
```

## Not finished / would do next

- Component-level tests driving the accordion and stepper through the DOM
  (`@testing-library/react` is already wired up for this).
- The Checkout button is a prototype confirmation only, as specified.
