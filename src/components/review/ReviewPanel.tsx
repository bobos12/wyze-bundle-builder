import { catalog } from "../../data/catalog";
import { useBundle } from "../../state/useBundle";
import { reviewGroups, totals } from "../../state/selectors";
import { PriceTag } from "../ui/PriceTag";
import { ReviewLine } from "./ReviewLine";
import { ReviewSummary } from "./ReviewSummary";
import styles from "./ReviewPanel.module.css";

/**
 * The right column: a live summary of the configured system. It is a pure
 * projection of the shared state, so it updates the instant anything changes.
 */
export function ReviewPanel() {
  const { state } = useBundle();
  const groups = reviewGroups(state);
  const bundleTotals = totals(state);
  const isEmpty = groups.length === 0;

  return (
    <div className={styles.panel}>
      <div className={styles.listCol}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Review</p>
          <h2 className={styles.title}>Your security system</h2>
          <p className={styles.subtitle}>
            Review your personalized protection system designed to keep what
            matters most safe.
          </p>
        </header>

        {isEmpty ? (
          <p className={styles.empty}>
            Your system is empty. Add cameras, sensors or a plan to get started.
          </p>
        ) : (
          <div className={styles.groups}>
            {groups.map((group) => (
              <section
                key={group.id}
                className={styles.group}
                aria-label={group.label}
              >
                <p className={styles.groupLabel}>{group.label}</p>
                <ul className={styles.lines}>
                  {group.lines.map((line) => (
                    <ReviewLine key={line.key} line={line} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className={styles.shipping}>
          <span className={styles.shipLeft}>
            <div className={styles.truckBox}>
              <img
                src="/icons/delivery.svg"
                alt=""
                className={styles.truck}
                aria-hidden="true"
              />
            </div>
            <span className={styles.shipLabel}>{catalog.shipping.label}</span>
          </span>
          <PriceTag
            active={catalog.shipping.active}
            compareAt={catalog.shipping.compareAt}
            size="lg"
          />
        </div>
      </div>

      <div className={styles.summaryCol}>
        <ReviewSummary totals={bundleTotals} />
      </div>
    </div>
  );
}
