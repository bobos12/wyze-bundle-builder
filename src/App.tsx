import styles from "./App.module.css";
import { Builder } from "./components/builder/Builder";
import { ReviewPanel } from "./components/review/ReviewPanel";

/**
 * Two-column experience: the step builder on the left, the live review panel
 * on the right (sticky on desktop, stacked beneath on smaller viewports).
 */
export function App() {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <section className={styles.builderCol} aria-label="Build your system">
          <Builder />
        </section>
        <aside className={styles.reviewCol} aria-label="Order summary">
          <ReviewPanel />
        </aside>
      </div>
    </main>
  );
}
