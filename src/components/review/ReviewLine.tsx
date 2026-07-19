import type { ReviewLine as ReviewLineModel } from "../../state/selectors";
import { asset } from "../../utils/asset";
import { useBundle } from "../../state/useBundle";
import { ProductImage } from "../builder/ProductImage";
import { PriceTag } from "../ui/PriceTag";
import { QuantityStepper } from "../ui/QuantityStepper";
import styles from "./ReviewLine.module.css";

/**
 * One summarised selection. Each variant with a quantity above zero is its own
 * line; the stepper here shares state with the matching product card, so edits
 * on either side stay in sync.
 */
export function ReviewLine({ line }: { line: ReviewLineModel }) {
  const { dispatch } = useBundle();

  const label = line.variantLabel
    ? `${line.name} (${line.variantLabel})`
    : line.name;

  // Review shows the line total (unit x quantity); plans show their /mo unit.
  const multiplier = line.showStepper ? line.qty : 1;
  const lineActive = line.unitActive * multiplier;
  const lineCompareAt =
    line.unitCompareAt !== undefined ? line.unitCompareAt * multiplier : undefined;

  const isPlan = !line.showStepper;

  return (
    <li className={styles.line}>
      <div className={`${styles.thumb} ${isPlan ? styles.planThumb : ""}`}>
        {isPlan ? (
          line.productId === "cam-unlimited" ? (
            <img
              src={asset("/icons/plan-shield.svg")}
              alt=""
              className={styles.planIcon}
              aria-hidden="true"
            />
          ) : (
            <ProductImage src={line.image} alt={line.name} />
          )
        ) : (
          <ProductImage src={line.image} alt={line.name} />
        )}
      </div>

      <div className={styles.info}>
        <p className={`${styles.name} ${isPlan ? styles.planName : ""}`}>
          {isPlan ? (
            <>
              {line.name.split(" ").map((word, idx) => (
                <span key={idx}>
                  {idx > 0 && <span className={styles.planNameHighlight}>{word}</span>}
                  {idx === 0 && word}
                  {idx < line.name.split(" ").length - 1 && " "}
                </span>
              ))}
            </>
          ) : (
            line.name
          )}
        </p>
        {line.variantLabel && (
          <p className={styles.variant}>{line.variantLabel}</p>
        )}
      </div>

      <div className={styles.stepperSlot}>
        {line.showStepper && (
          <QuantityStepper
            quantity={line.qty}
            label={label}
            size="sm"
            onIncrement={() =>
              dispatch({ type: "increment", productId: line.productId, variantId: line.variantId })
            }
            onDecrement={() =>
              dispatch({ type: "decrement", productId: line.productId, variantId: line.variantId })
            }
          />
        )}
      </div>

      <div className={styles.price}>
        <PriceTag
          active={lineActive}
          compareAt={lineCompareAt}
          cadence={line.cadence}
          size="lg"
        />
      </div>
    </li>
  );
}
