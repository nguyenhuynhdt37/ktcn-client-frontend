"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Palette, Check, X } from "lucide-react";
import styles from "../cet.module.css";

const themes = [
  ["red", "Đỏ đô", "Burgundy"],
  ["wine", "Đỏ rượu vang", "Wine"],
  ["copper", "Nâu đồng", "Copper"],
  ["vinh", "Xanh Vinh", "Vinh blue"],
  ["green", "Xanh lục thẫm", "Forest green"],
  ["charcoal", "Xám than", "Charcoal"],
];

export function CetTheme({ children, locale }: { children: ReactNode; locale: string }) {
  const [theme, setTheme] = useState("red");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isEn = locale === "en";

  // Publish the sticky nav's real height as --cet-nav-h so in-page anchors
  // (scroll-margin-top) clear it at every breakpoint.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let observer: ResizeObserver | undefined;
    let observed: Element | null = null;
    let frame = 0;
    const publish = () => {
      if (observed) {
        root.style.setProperty("--cet-nav-h", `${Math.round(observed.getBoundingClientRect().height)}px`);
      }
    };
    const attach = () => {
      const nav = root.querySelector(`.${styles.mainnav}`);
      if (!nav) return false;
      observed = nav;
      publish();
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(publish);
        observer.observe(nav);
      }
      return true;
    };
    if (!attach()) frame = requestAnimationFrame(attach);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      root.style.removeProperty("--cet-nav-h");
    };
  }, []);

  return (
    <div className={styles.site} data-cet-theme={theme} ref={rootRef}>
      {children}
      <div
        className={styles.themePicker}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        {open && (
          <div className={styles.themePanel} id="cet-theme-panel">
            <strong>{isEn ? "Theme colour" : "Màu giao diện"}</strong>
            {themes.map(([value, vi, en]) => (
              <button
                key={value}
                type="button"
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                <span className={styles.swatch} data-colour={value} />
                {isEn ? en : vi}
                {theme === value && <Check size={16} aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
        <button
          className={styles.fab}
          type="button"
          aria-label={isEn ? "Choose theme colour" : "Chọn màu giao diện"}
          aria-expanded={open}
          aria-controls="cet-theme-panel"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Palette size={20} />}
        </button>
      </div>
      <a
        className={`${styles.fab} ${styles.toTop}`}
        href="#cet-top"
        aria-label={isEn ? "Back to top" : "Lên đầu trang"}
      >
        <ArrowUp size={20} />
      </a>
    </div>
  );
}
