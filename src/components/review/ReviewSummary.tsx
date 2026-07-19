import { useEffect, useRef, useState } from "react";
import { catalog } from "../../data/catalog";
import type { Totals } from "../../state/selectors";
import { useBundle } from "../../state/useBundle";
import { formatMoney } from "../../utils/format";
import styles from "./ReviewSummary.module.css";

/**
 * The fixed lower section of the review panel: the guarantee + financing
 * block, the recalculating total, savings, and the checkout / save-for-later
 * actions. (Fast Shipping lives in ReviewPanel, as the last line of the
 * itemised list.)
 */
export function ReviewSummary({ totals }: { totals: Totals }) {
  const { save } = useBundle();
  const [saved, setSaved] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function handleSave() {
    const ok = save();
    setSaved(ok);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaved(false), 2500);
  }

  const hasSavings = totals.savings > 0;

  return (
    <div className={styles.summary}>
      <div className={styles.guaranteeGrid}>
        <img
          src="/icons/satisfaction-badge.png"
          alt="30-day Wyze satisfaction guarantee"
          className={styles.seal}
        />
        <div className={styles.guaranteeText}>
          <p className={styles.guaranteeHeading}>
            {catalog.guarantee.returnsHeading}
          </p>
          <p className={styles.guaranteeBody}>{catalog.guarantee.returnsBody}</p>
        </div>
        <div className={styles.totalsRow}>
          <span className={styles.finance}>
            as low as {formatMoney(totals.financingPerMonth)}/mo
          </span>
          <div className={styles.totalLine}>
            {totals.compareTotal > totals.activeTotal && (
              <span className={styles.compareTotal}>
                {formatMoney(totals.compareTotal)}
              </span>
            )}
            <span className={styles.grandTotal}>
              {formatMoney(totals.activeTotal)}
            </span>
          </div>
        </div>
      </div>

      {hasSavings && (
        <p className={styles.savings}>
          Congrats! You&rsquo;re saving {formatMoney(totals.savings)} on your
          security bundle!
        </p>
      )}

      {checkedOut ? (
        <div className={styles.confirm} role="status">
          <strong>Order placed.</strong> This is a prototype checkout — nothing
          was charged.
          <button
            type="button"
            className={styles.confirmBack}
            onClick={() => setCheckedOut(false)}
          >
            Keep editing
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.checkout}
          onClick={() => setCheckedOut(true)}
        >
          Checkout
        </button>
      )}

      <button type="button" className={styles.saveLink} onClick={handleSave}>
        {saved ? "Saved ✓" : "Save my system for later"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {saved ? "Your system has been saved." : ""}
      </span>
    </div>
  );
}
