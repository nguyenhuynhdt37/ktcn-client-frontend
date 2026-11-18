"use client";

import type { ComponentProps } from "react";
import { Link } from "@/i18n/routing";
import { Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { MarqueeNoticeItem } from "../types/notification.types";

interface MarqueeNoticeProps {
  notices: MarqueeNoticeItem[];
}

export function MarqueeNotice({ notices = [] }: MarqueeNoticeProps) {
  const t = useTranslations("common");

  if (notices.length === 0) return null;

  return (
    <div className="border-border w-full overflow-hidden border-b bg-white">
      <div className="site-container flex min-h-11 items-center gap-3">
        {/* Nhãn cố định bên trái */}
        <div className="text-brand-darkred flex shrink-0 items-center gap-2 text-sm font-semibold select-none">
          <Volume2 size={16} aria-hidden="true" />
          <span>{t("notices_title") || "Thông báo"}:</span>
        </div>

        {/* Khung chạy chữ */}
        <div className="relative h-6 flex-1 overflow-hidden">
          <div className="animate-marquee absolute top-0 flex cursor-pointer gap-10 whitespace-nowrap hover:[animation-play-state:paused]">
            {notices.map((notice) => (
              <Link
                key={`primary-${notice.id}`}
                href={notice.href as ComponentProps<typeof Link>["href"]}
                className="hover:text-brand-darkred flex min-h-6 items-center text-sm font-medium text-slate-700 transition-colors duration-150"
              >
                <span>{notice.title}</span>
              </Link>
            ))}
            <div aria-hidden="true" className="flex gap-10">
              {notices.map((notice) => (
                <Link
                  key={`clone-${notice.id}`}
                  href={notice.href as ComponentProps<typeof Link>["href"]}
                  tabIndex={-1}
                  className="hover:text-brand-darkred flex min-h-6 items-center text-sm font-medium text-slate-700 transition-colors duration-150"
                >
                  <span>{notice.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
