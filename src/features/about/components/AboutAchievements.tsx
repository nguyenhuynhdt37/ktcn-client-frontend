// src/features/about/components/AboutAchievements.tsx
"use client";

import { useTranslations } from "next-intl";
import { ACHIEVEMENTS } from "../constants/about-data";

export function AboutAchievements() {
  const t = useTranslations("about");

  return (
    <section className="py-14 md:py-20 bg-slate-50/30">
      <div className="max-w-[1360px] mx-auto px-6 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand-darkred bg-brand-darkred/6 rounded-full">
            {t("achievements_heading")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t("achievements_heading")}
          </h2>
        </div>

        {/* Premium Grid layout for achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACHIEVEMENTS.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start gap-4.5 p-6 border border-slate-200/80 rounded-2xl bg-white shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300 ease-out"
            >
              {/* Highlight number / icon */}
              <div className="w-11 h-11 shrink-0 flex items-center justify-center bg-brand-darkred/5 text-brand-darkred rounded-xl font-mono font-bold text-sm">
                {idx + 1}
              </div>
              
              <div className="space-y-2 min-w-0">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {t(item.titleKey)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {t(item.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
