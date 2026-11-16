"use client";

import { BrandLogo } from "@/shared/components/ui/brand-logo";
import { useLocale, useTranslations } from "next-intl";
import type { SiteSettings } from "@/features/setting/types/setting.types";
import { sanitizeExternalUrl } from "@/features/setting/services/settingService";

export function FacebookFanpage({ settings }: { settings?: SiteSettings | null }) {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isEn = locale === "en";

  const facebookUrl = sanitizeExternalUrl(settings?.facebook_url, "https://www.facebook.com/Vienktcn");
  const fanpageSrc =
    settings?.fanpage_image_url ||
    settings?.fanpage_image_object_key ||
    settings?.footer_logo_url ||
    settings?.footer_logo_object_key ||
    settings?.header_logo_url ||
    settings?.header_logo_object_key;
  const logoAlt = isEn ? settings?.logo_alt_en : settings?.logo_alt_vi;

  return (
    <div className="space-y-5">
      <div className="text-base font-bold text-slate-900">{t("fanpage")}</div>
      <a
        href={facebookUrl}
        target={facebookUrl !== "#" ? "_blank" : undefined}
        rel={facebookUrl !== "#" ? "noopener noreferrer" : undefined}
        className="border border-slate-200/80 relative block w-full max-w-[260px] overflow-hidden rounded-lg bg-white p-3.5 transition-opacity duration-150 hover:opacity-90 shadow-sm"
      >
        <div className="relative aspect-[3/1] w-full">
          <BrandLogo
            src={fanpageSrc}
            alt={logoAlt}
            sizes="230px"
            className="object-contain"
          />
        </div>
      </a>
    </div>
  );
}
