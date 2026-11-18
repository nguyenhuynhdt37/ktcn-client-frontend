"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Newspaper, HelpCircle } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="relative flex min-h-[75vh] flex-col items-center justify-center px-6 py-20 text-slate-800 bg-transparent">
      
      {/* Decorative background glow to match the premium theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-darkred/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        
        {/* Styled 404 Illustration */}
        <div className="relative mx-auto w-44 h-44 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/70 rounded-full border border-slate-200/50 shadow-sm animate-pulse duration-[3000ms]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-brand-darkred to-brand-blue leading-none">
              404
            </span>
            <div className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
              Page Not Found
            </div>
          </div>

          {/* Floating Help Circle icon */}
          <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-600 p-1.5 rounded-lg rotate-12 shadow-sm border border-amber-500/10">
            <HelpCircle size={16} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t("page_not_found_title")}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-[38ch] mx-auto leading-relaxed font-normal">
            {t("page_not_found_desc")}
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-darkred px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-brand-darkred-dark active:scale-98"
          >
            <ArrowLeft size={14} />
            <span>{t("go_home")}</span>
          </Link>
          <Link
            href="/tin-tuc"
            className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-white/70 px-6 py-2.5 text-xs font-bold text-slate-700 backdrop-blur-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-300 active:scale-98"
          >
            <Newspaper size={14} className="text-slate-500" />
            <span>{t("view_news")}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
