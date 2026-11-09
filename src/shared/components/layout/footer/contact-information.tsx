"use client";

import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function ContactInformation() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-5">
      {/* Logo */}
      <div className="relative h-11 w-52 sm:w-56">
        <Image
          src="/images/logo.svg"
          alt="Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh"
          fill
          unoptimized
          className="object-contain object-left py-0.5"
          sizes="224px"
        />
      </div>
      <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">{tCommon("college_name")}</div>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600">
        <p className="flex items-start gap-2.5">
          <MapPin size={16} className="text-brand-blue/70 mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-slate-700">{t("address")}:</strong> {tCommon("school_address")}
          </span>
        </p>
        <p className="flex items-center gap-2.5">
          <Phone size={16} className="text-brand-blue/70 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-slate-700">{t("phone")}:</strong> 0238 3855 452
          </span>
        </p>
        <p className="flex items-center gap-2.5">
          <Mail size={16} className="text-brand-blue/70 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-slate-700">Email:</strong> vienktcn@vinhuni.edu.vn
          </span>
        </p>
        <p className="flex items-center gap-2.5">
          <Globe size={16} className="text-brand-blue/70 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-slate-700">{t("website")}:</strong> ktcn.itup.io.vn
          </span>
        </p>
        <p className="border-border mt-1 border-t pt-3 text-sm leading-relaxed text-slate-600">
          <strong className="text-slate-600">{t("responsible_officer")}:</strong>
          <br />
          {t("dean_name")}
        </p>
      </div>
    </div>
  );
}
