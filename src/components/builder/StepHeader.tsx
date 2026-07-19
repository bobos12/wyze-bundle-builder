import type { IconKey } from "../../data/types";
import { StepIcon } from "../icons";
import styles from "./StepHeader.module.css";

interface StepHeaderProps {
  ordinal: string;
  title: string;
  icon: IconKey;
  isOpen: boolean;
  selectedCount: number;
  panelId: string;
  isFirst?: boolean;
  onToggle: () => void;
}

/**
 * The clickable step header: ordinal eyebrow, icon + title, and a right-side
 * state indicator ("N selected" + chevron when open, chevron only when closed).
 */
export function StepHeader({
  ordinal,
  title,
  icon,
  isOpen,
  selectedCount,
  panelId,
  isFirst = false,
  onToggle,
}: StepHeaderProps) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.ordinal}>{ordinal}</p>
      {!isFirst && <div className={styles.divider} aria-hidden="true" />}
      <button
        type="button"
        className={styles.header}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className={styles.titleGroup}>
          <StepIcon name={icon} className={styles.icon} aria-hidden="true" />
          <span className={styles.title}>{title}</span>
        </span>
        <span className={styles.state}>
          {selectedCount > 0 && (
            <span className={styles.count}>{selectedCount} selected</span>
          )}
          <img
            src="/icons/caret-down.png"
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
            alt=""
            aria-hidden="true"
          />
        </span>
      </button>
    </div>
  );
}
