// src/features/about/components/AboutOverview.tsx
import { useTranslations } from "next-intl";
import { SafeImage } from "@/shared/components/ui/safe-image";

export function AboutOverview() {
  const t = useTranslations("about");

  return (
    <section className="py-14 md:py-20">
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Cột trái: Text */}
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              {t("overview_heading")}
            </h2>
            <div className="w-16 h-[2px] bg-brand-darkred" />
            <p className="text-base text-slate-600 leading-relaxed text-justify">
              {t("overview_p1")}
            </p>
            <p className="text-base text-slate-600 leading-relaxed text-justify">
              {t("overview_p2")}
            </p>
            <p className="text-base text-slate-600 leading-relaxed text-justify">
              {t("overview_p3")}
            </p>
          </div>

          {/* Cột phải: Ảnh */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
              <SafeImage
                src="/images/about/set-overview.jpg"
                alt={t("overview_img_alt")}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
