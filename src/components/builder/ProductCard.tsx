import type { Product } from "../../data/types";
import { useBundle } from "../../state/useBundle";
import {
  activeVariantId,
  productQuantity,
  variantQuantity,
} from "../../state/selectors";
import { discountPercent } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { PriceTag } from "../ui/PriceTag";
import { QuantityStepper } from "../ui/QuantityStepper";
import { VariantSelector } from "../ui/VariantSelector";
import { ProductImage } from "./ProductImage";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  stepId: string;
}

/**
 * A single product card. Data-driven: badge, variants, stepper and pricing all
 * render (or not) purely from the product record. The card's stepper is bound
 * to the *active* variant, and its selected styling reflects total quantity.
 */
export function ProductCard({ product, stepId }: ProductCardProps) {
  const { state, dispatch } = useBundle();

  const isSingle = product.selectionMode === "single";
  const activeVariant = activeVariantId(state, product);
  const activeVariantQty = variantQuantity(state, product.id, activeVariant);
  const totalQty = productQuantity(state, product.id);
  const isSelected = totalQty > 0;

  const badgePercent =
    product.price.compareAt !== undefined
      ? discountPercent(product.price.compareAt, product.price.active)
      : 0;

  const variantLabel =
    product.variants?.find((v) => v.id === activeVariant)?.label;
  const stepperLabel = variantLabel
    ? `${product.name} (${variantLabel})`
    : product.name;

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      aria-label={product.name}
    >
      {badgePercent > 0 && (
        <span className={styles.badge}>
          <Badge>Save {badgePercent}%</Badge>
        </span>
      )}

      <div className={styles.media}>
        <ProductImage src={product.image} alt={product.name} />
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.title}>{product.name}</h3>
          <p className={styles.desc}>
            {product.description}{" "}
            <a
              className={styles.link}
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Learn More
            </a>
          </p>
        </div>

        {product.variants && product.variants.length > 0 && (
          <VariantSelector
            productName={product.name}
            variants={product.variants}
            activeVariantId={activeVariant}
            productImage={product.image}
            isSelected={(vid) => variantQuantity(state, product.id, vid) > 0}
            onSelect={(variantId) =>
              dispatch({ type: "setActiveVariant", productId: product.id, variantId })
            }
          />
        )}

        <div className={styles.bottom}>
          {isSingle ? (
            <button
              type="button"
              aria-pressed={isSelected}
              className={`${styles.choose} ${isSelected ? styles.chosen : ""}`}
              onClick={() =>
                dispatch({ type: "selectSingle", stepId, productId: product.id })
              }
            >
              <span className={styles.radio} aria-hidden="true" />
              {isSelected ? "Selected" : "Choose plan"}
            </button>
          ) : (
            <QuantityStepper
              quantity={activeVariantQty}
              min={product.required ? 1 : 0}
              label={stepperLabel}
              onIncrement={() =>
                dispatch({ type: "increment", productId: product.id, variantId: activeVariant })
              }
              onDecrement={() =>
                dispatch({ type: "decrement", productId: product.id, variantId: activeVariant })
              }
            />
          )}

          <PriceTag
            active={product.price.active}
            compareAt={product.price.compareAt}
            cadence={product.price.cadence}
          />
        </div>
      </div>
    </article>
  );
}
