import { catalog } from "../../data/catalog";
import { Step } from "./Step";
import styles from "./Builder.module.css";

/** The left column: the four-step accordion that assembles the system. */
export function Builder() {
  const total = catalog.steps.length;
  return (
    <div className={styles.builder}>
      <h1 className={styles.title}>Let's get started!</h1>
      {catalog.steps.map((step, index) => (
        <Step key={step.id} step={step} index={index} total={total} />
      ))}
    </div>
  );
}
