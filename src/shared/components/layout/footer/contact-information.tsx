"use client";

import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BrandLogo } from "@/shared/components/ui/brand-logo";
import type { SiteSettings } from "@/features/setting/types/setting.types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function ContactInformation({ settings }: { settings?: SiteSettings | null }) {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isEn = locale === "en";

  const logoSrc =
    settings?.footer_logo_url ||
    settings?.footer_logo_object_key ||
    settings?.header_logo_url ||
    settings?.header_logo_object_key;
  const logoAlt = isEn ? settings?.logo_alt_en : settings?.logo_alt_vi;
  const collegeName =
    (isEn ? settings?.college_name_en : settings?.college_name_vi) || tCommon("college_name");
  const address = (isEn ? settings?.address_en : settings?.address_vi) || tCommon("school_address");
  const phone = settings?.phone || "0238 3855 452";
  const email = settings?.email || "vienktcn@vinhuni.edu.vn";
  const website = settings?.website || "ktcn.itup.io.vn";
  const responsibleOfficer =
    (isEn ? settings?.responsible_officer_en : settings?.responsible_officer_vi) || t("dean_name");

  return (
    <div className="space-y-5">
      {/* Logo */}
      <div className="relative h-11 w-52 sm:w-56">
        <BrandLogo
          src={logoSrc}
          alt={logoAlt}
          className="object-contain object-left py-0.5"
          sizes="(max-width: 639px) 208px, 224px"
        />
      </div>
      <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">{collegeName}</div>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600">
        <p className="flex items-start gap-2.5">
          <MapPin size={16} className="text-brand-blue/70 mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-slate-700">{t("address")}:</strong> {address}
          </span>
        </p>
        <p className="flex items-center gap-2.5">
          <Phone size={16} className="text-brand-blue/70 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-slate-700">{t("phone")}:</strong> {phone}
          </span>
        </p>
        <p className="flex items-center gap-2.5">
          <Mail size={16} className="text-brand-blue/70 shrink-0" aria-hidden="true" />
          {/* Keep Cloudflare's email decoder from changing React's server HTML. */}
          <span
            dangerouslySetInnerHTML={{
              __html: `<strong class="text-slate-700">Email:</strong> <!--email_off-->${escapeHtml(email)}<!--/email_off-->`,
            }}
          />
        </p>
        <p className="flex items-center gap-2.5">
          <Globe size={16} className="text-brand-blue/70 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-slate-700">{t("website")}:</strong> {website}
          </span>
        </p>
        <p className="border-border mt-1 border-t pt-3 text-sm leading-relaxed text-slate-600">
          <strong className="text-slate-600">{t("responsible_officer")}:</strong>
          <br />
          {responsibleOfficer}
        </p>
      </div>
    </div>
  );
}
