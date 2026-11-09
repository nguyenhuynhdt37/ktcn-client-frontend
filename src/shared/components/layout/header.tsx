"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Navigation } from "./navigation";
import type { MenuTreeResponse } from "@/features/menu/types/menu.types";

interface HeaderProps {
  initialMenu: MenuTreeResponse | null;
}

export function Header({ initialMenu }: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => setIsSticky(!entry.isIntersecting), {
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />
      <header
        className={`sticky top-0 z-40 w-full border-b transition-[background-color,box-shadow] duration-200 ${
          isSticky
            ? "border-border/80 bg-white/90 shadow-sm backdrop-blur-md"
            : "border-border/40 bg-white/85 backdrop-blur-md"
        }`}
      >
        <div
          className="site-container flex items-center justify-between gap-4 h-[4.5rem]"
        >
          <div className="flex min-w-0 items-center">
            <Link href="/" className="flex items-center rounded-md" aria-label="Trang chủ">
              <div
                className="relative h-14 w-64 sm:w-72 md:w-80"
              >
                <Image
                  src="/images/logo.svg"
                  alt="Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 640px) 256px, 320px"
                  className="object-contain object-left py-0.5"
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-end">
            <Navigation initialMenu={initialMenu} />
          </div>
        </div>
      </header>
    </>
  );
}
