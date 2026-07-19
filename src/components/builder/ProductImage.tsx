import { useState } from "react";
import styles from "./ProductImage.module.css";

interface ProductImageProps {
  src: string;
  alt: string;
}

/**
 * Product photo with a graceful fallback. If the raster fails to load we render
 * a neutral placeholder instead of a broken-image icon, so the layout never
 * shifts and the card stays presentable.
 */
export function ProductImage({ src, alt }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={styles.placeholder} role="img" aria-label={alt}>
        <svg viewBox="0 0 48 48" aria-hidden="true" width="40" height="40">
          <rect x="6" y="10" width="36" height="28" rx="4" fill="#e6ebf0" />
          <circle cx="18" cy="22" r="4" fill="#ced6de" />
          <path d="M12 36l9-9 6 6 5-5 6 6v2H12z" fill="#ced6de" />
        </svg>
      </div>
    );
  }

  return (
    <img
      className={styles.image}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
