import type { ReactNode } from "react";
import styles from "../cet-inner.module.css";

export function CetSideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.sideCard}>
      <h2 className={styles.sideTitle}>{title}</h2>
      {children}
    </section>
  );
}
