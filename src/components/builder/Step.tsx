import { useEffect, useRef } from "react";
import { catalog } from "../../data/catalog";
import type { Step as StepModel } from "../../data/types";
import { useBundle } from "../../state/useBundle";
import { stepSelectedCount } from "../../state/selectors";
import { ProductCard } from "./ProductCard";
import { StepHeader } from "./StepHeader";
import styles from "./Step.module.css";

interface StepProps {
  step: StepModel;
  index: number;
  total: number;
}

/**
 * One accordion step: a toggle header plus a collapsible panel of product
 * cards. The panel animates its height via the `grid-template-rows` 0fr→1fr
 * technique, and is marked `inert` when collapsed so hidden controls stay out
 * of the tab order.
 */
export function Step({ step, index, total }: StepProps) {
  const { state, dispatch } = useBundle();
  const isOpen = state.openStepId === step.id;
  const selectedCount = stepSelectedCount(state, step.id);
  const panelId = `panel-${step.id}`;
  const nextStep = catalog.steps[index + 1];

  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Keep collapsed content unfocusable and hidden from assistive tech.
    const node = innerRef.current;
    if (node) node.inert = !isOpen;
  }, [isOpen]);

  return (
    <section className={`${styles.step} ${isOpen ? styles.open : ""}`}>
      <StepHeader
        ordinal={`Step ${index + 1} of ${total}`}
        title={step.title}
        icon={step.icon}
        isOpen={isOpen}
        selectedCount={selectedCount}
        panelId={panelId}
        onToggle={() => dispatch({ type: "toggleStep", stepId: step.id })}
      />

      <div className={`${styles.panel} ${isOpen ? styles.open : ""}`}>
        <div className={styles.panelClip}>
          <div id={panelId} ref={innerRef} className={styles.panelInner}>
            <div className={styles.grid}>
              {step.products.map((product) => (
                <ProductCard key={product.id} product={product} stepId={step.id} />
              ))}
            </div>

            {nextStep && (
              <button
                type="button"
                className={styles.next}
                onClick={() => dispatch({ type: "openStep", stepId: nextStep.id })}
              >
                Next: {nextStep.title}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
