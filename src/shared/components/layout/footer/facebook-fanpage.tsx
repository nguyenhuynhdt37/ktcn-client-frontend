"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function FacebookFanpage() {
  const t = useTranslations("footer");

  return (
    <div className="space-y-5">
      <div className="text-base font-bold text-slate-900">{t("fanpage")}</div>
      <a
        href="https://www.facebook.com/Vienktcn"
        target="_blank"
        rel="noopener noreferrer"
        className="border border-slate-200/80 relative block w-full max-w-[260px] overflow-hidden rounded-lg bg-white p-3.5 transition-opacity duration-150 hover:opacity-90 shadow-sm"
      >
        <div className="relative aspect-[3/1] w-full">
          <Image
            src="/images/logo.svg"
            alt="Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh"
            fill
            unoptimized
            sizes="(max-w-768px) 100vw, 260px"
            className="object-contain"
          />
        </div>
      </a>
    </div>
  );
}
