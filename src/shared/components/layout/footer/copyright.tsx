"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import type { SiteSettings } from "@/features/setting/types/setting.types";
import { sanitizeExternalUrl } from "@/features/setting/services/settingService";

export function Copyright({ settings }: { settings?: SiteSettings | null }) {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isEn = locale === "en";
  const year = new Date().getFullYear();

  const rawCopyright = isEn ? settings?.copyright_en : settings?.copyright_vi;
  const copyrightText = rawCopyright
    ? rawCopyright.replace(/\{year\}/g, String(year))
    : t("copyright", { year });
  const developerName = settings?.developer_name || "CLB ITUP";
  const developerUrl = sanitizeExternalUrl(
    settings?.developer_url,
    "https://www.facebook.com/itup.binhdanhocvuso.dhv/",
  );

  useEffect(() => {
    // Ký hiệu ẩn trong Developer Tools Console
    console.log(
      "%c⚙️ COLLEGE OF ENGINEERING & TECHNOLOGY - VINH UNIVERSITY\n" +
        "%c⚡ SET VinhUni Portal v1.0.0\n" +
        "%cDeveloped by Nguyễn Xuân Huỳnh & Nguyễn Trọng Truyền",
      "background: #da251d; color: #fff; padding: 10px 20px; font-size: 14px; font-weight: bold; font-family: 'Courier New', monospace; display: block; border-radius: 4px 4px 0 0;",
      "background: #0f172a; color: #38bdf8; padding: 8px 20px; font-size: 12px; font-weight: bold; font-family: 'Courier New', monospace; display: block;",
      "background: #1e293b; color: #94a3b8; padding: 8px 20px; font-size: 11px; font-family: 'Courier New', monospace; display: block; border-radius: 0 0 4px 4px;",
    );
  }, []);

  return (
    <div className="bg-brand-darkred-dark px-6 py-4 text-center text-sm font-normal text-white/80">
      <div className="site-container flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
        <span>{copyrightText}</span>
        {developerName && (
          <>
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="text-white/60">
              {isEn ? "Developed by " : "Phát triển bởi "}
              <a
                href={developerUrl}
                target={developerUrl !== "#" ? "_blank" : undefined}
                rel={developerUrl !== "#" ? "noopener noreferrer" : undefined}
                className="hover:text-brand-yellow underline transition-colors duration-150 font-medium text-white/90"
                title={developerName}
              >
                {developerName}
              </a>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
