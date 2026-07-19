import styles from "./Badge.module.css";

/** The purple "Save X%" discount pill anchored to a product image. */
export function Badge({ children }: { children: React.ReactNode }) {
  return <span className={styles.badge}>{children}</span>;
}
