"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { BrandLogo } from "@/shared/components/ui/brand-logo";
import { Link } from "@/i18n/routing";
import { Navigation } from "./navigation";
import type { MenuTreeResponse } from "@/features/menu/types/menu.types";
import type { SiteSettings } from "@/features/setting/types/setting.types";

interface HeaderProps {
  initialMenu: MenuTreeResponse | null;
  settings?: SiteSettings | null;
}

export function Header({ initialMenu, settings }: HeaderProps) {
  const locale = useLocale();
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const logoAlt = locale === "en" ? settings?.logo_alt_en : settings?.logo_alt_vi;

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
        data-streamed-chrome=""
        className={`sticky top-0 z-40 w-full border-b transition-[background-color,box-shadow] duration-200 ${
          isSticky
            ? "border-border/80 bg-white/90 shadow-sm backdrop-blur-md"
            : "border-border/40 bg-white/85 backdrop-blur-md"
        }`}
      >
        <div className="site-container flex min-h-[4.5rem] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center">
            <Link href="/" className="flex items-center rounded-md" aria-label="Trang chủ">
              <div
                className="relative h-14 w-64 sm:w-72 md:w-80"
                style={
                  settings?.header_logo_width || settings?.header_logo_height
                    ? {
                        width: settings.header_logo_width || 320,
                        height: settings.header_logo_height || 56,
                        maxWidth: "60vw",
                        marginBlock: 8,
                      }
                    : undefined
                }
              >
                <BrandLogo
                  eager
                  src={settings?.header_logo_url || settings?.header_logo_object_key}
                  alt={logoAlt}
                  sizes="(max-width: 639px) 256px, (max-width: 767px) 288px, 320px"
                  className="object-contain object-left py-0.5"
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-end">
            <Navigation initialMenu={initialMenu} />
          </div>
        </div>
        <span hidden data-stream-complete="" />
      </header>
    </>
  );
}
