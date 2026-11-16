"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { FooterLinkItem } from "@/features/setting/types/setting.types";
import { sanitizeExternalUrl } from "@/features/setting/services/settingService";

const DEFAULT_QUICK_LINKS = [
  { labelKey: "contact", href: "/tu-van-tuyen-sinh" },
  { labelKey: "library", href: "/thu-vien" },
  { labelKey: "sitemap", href: "/so-do-trang" },
  { labelKey: "campus_map", href: "/so-do-truong" },
  { labelKey: "tour", href: "/tham-quan-trai-nghiem" },
];

export function QuickLinks({ links }: { links?: FooterLinkItem[] | null }) {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isEn = locale === "en";
  const hasCustom = Boolean(links && links.length > 0);

  return (
    <div className="space-y-5">
      <div className="text-base font-bold text-slate-900">{t("info")}</div>
      <ul className="space-y-2">
        {hasCustom
          ? links!.map((link, idx) => {
              const label = isEn ? link.label_en || link.label_vi : link.label_vi || link.label_en;
              const href = sanitizeExternalUrl(link.href, "#");
              const isExternal = href.startsWith("http://") || href.startsWith("https://") || href === "#";
              return (
                <li key={`${href}-${idx}`}>
                  {isExternal ? (
                    <a
                      href={href}
                      target={link.open_in_new_tab ? "_blank" : undefined}
                      rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                      className="hover:text-brand-darkred flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 transition-colors duration-150"
                    >
                      <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href as any}
                      target={link.open_in_new_tab ? "_blank" : undefined}
                      className="hover:text-brand-darkred flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 transition-colors duration-150"
                    >
                      <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
                      {label}
                    </Link>
                  )}
                </li>
              );
            })
          : DEFAULT_QUICK_LINKS.map((link) => (
              <li key={link.labelKey}>
                <Link
                  href={link.href as any}
                  className="hover:text-brand-darkred flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 transition-colors duration-150"
                >
                  <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
      </ul>
    </div>
  );
}
