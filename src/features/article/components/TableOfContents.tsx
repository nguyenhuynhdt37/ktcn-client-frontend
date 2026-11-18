"use client";

import { useState, useEffect } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import { HeadingItem } from "../utils/parse-headings";

interface TableOfContentsProps {
  headings: HeadingItem[];
  title?: string;
  expandText?: string;
  collapseText?: string;
  variant?: "inline" | "sidebar";
  className?: string;
}

export function TableOfContents({
  headings,
  title = "Mục lục nội dung",
  expandText = "Hiện",
  collapseText = "Ẩn",
  variant = "inline",
  className = "",
}: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>("");

  // Thuật toán Scrollspy: Theo dõi vị trí cuộn để highlight mục lục tương ứng
  useEffect(() => {
    if (headings.length === 0) return;

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const getDocTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

    const handleScroll = () => {
      // Khoảng cách từ đỉnh màn hình để kích hoạt highlight (bù trừ cho sticky header)
      const scrollOffset = 140;
      const scrollPosition = window.scrollY + scrollOffset;

      let currentActiveId = "";

      for (let i = 0; i < headingElements.length; i++) {
        const currentEl = headingElements[i];
        const nextEl = headingElements[i + 1];

        const currentTop = getDocTop(currentEl);
        const nextTop = nextEl ? getDocTop(nextEl) : Infinity;

        if (scrollPosition >= currentTop && scrollPosition < nextTop) {
          currentActiveId = currentEl.id;
          break;
        }
      }

      if (!currentActiveId && scrollPosition < getDocTop(headingElements[0])) {
        currentActiveId = "";
      }

      if (!currentActiveId) {
        const lastEl = headingElements[headingElements.length - 1];
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
          currentActiveId = lastEl.id;
        }
      }

      setActiveId((prev) => (prev === currentActiveId ? prev : currentActiveId));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const frame = requestAnimationFrame(handleScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  // 1. RENDER VARIANT SIDEBAR (Word-like Navigation Pane - Premium Floating Style)
  if (variant === "sidebar") {
    return (
      <div className={`space-y-3 py-2 ${className}`}>
        {/* Tiêu đề mục lục mỏng nhẹ, tinh tế */}
        <div className="border-border mb-3 flex items-center gap-2 border-b pb-2.5 text-sm font-semibold text-slate-600 select-none">
          <List size={13} className="text-brand-darkred" />
          <span>{title}</span>
        </div>

        {/* Cấu trúc trục dọc (border-l) cực kỳ mảnh và sang trọng */}
        <nav className="relative pl-0.5">
          <ul className="relative space-y-1.5 border-l border-slate-100 py-0.5">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;

              return (
                <li
                  key={heading.id}
                  className={`group relative rounded-r-none transition-all duration-200 ${heading.level === 3 ? "pl-7" : "pl-4"} ${
                    isActive
                      ? "before:bg-brand-darkred bg-brand-darkred/[0.04] before:absolute before:top-0 before:bottom-0 before:-left-[1px] before:w-[2px]"
                      : "before:absolute before:top-0 before:bottom-0 before:-left-[1px] before:w-0 before:bg-slate-200 before:transition-all hover:bg-slate-50/80 hover:before:w-[1.5px]"
                  } `}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleLinkClick(e, heading.id)}
                    className={`block py-2 pr-3 text-left leading-snug transition-all duration-200 ${
                      heading.level === 3
                        ? "group-hover:text-brand-darkred text-sm font-normal text-slate-600"
                        : "group-hover:text-brand-darkred text-[14px] font-medium text-slate-600"
                    } ${isActive ? "!text-brand-darkred font-bold" : ""} `}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    );
  }

  // 2. RENDER VARIANT INLINE (Tinh chỉnh lại đẹp hơn cho Mobile/Tablet)
  return (
    <div
      className={`my-8 w-full max-w-2xl rounded-none border border-slate-200/50 bg-slate-50/60 p-5 transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200/40 pb-3 select-none">
        <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-800 uppercase">
          <List size={16} className="text-brand-darkred" />
          <span>{title}</span>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="hover:text-brand-darkred flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition-colors duration-200 focus:outline-none"
        >
          <span>{isOpen ? collapseText : expandText}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isOpen && (
        <nav className="mt-3 pt-1">
          <ul className="space-y-2.5 text-sm">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;

              return (
                <li
                  key={heading.id}
                  style={{
                    paddingLeft: heading.level === 3 ? "1.5rem" : "0px",
                  }}
                  className="transition-all duration-200"
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleLinkClick(e, heading.id)}
                    className={`relative inline-block py-0.5 leading-snug transition-all duration-200 ${
                      heading.level === 3
                        ? "hover:text-brand-darkred text-sm text-slate-600"
                        : "hover:text-brand-darkred font-medium text-slate-700"
                    } ${
                      isActive
                        ? "text-brand-darkred before:bg-brand-darkred pl-2.5 font-semibold before:absolute before:top-1/2 before:left-0 before:h-2.5 before:w-1 before:-translate-y-1/2"
                        : ""
                    } `}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
