import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Bell, ArrowRight } from "lucide-react";
import { HeroSlider } from "./HeroSlider";
import { BannerResponse } from "../types/banner.types";
import type { NoticeItem } from "@/features/notification/types/notification.types";

interface HomeHeroWidgetProps {
  banners: BannerResponse[];
  notices: NoticeItem[];
  locale: string;
}
export function HomeHeroWidget({ banners, notices = [], locale }: HomeHeroWidgetProps) {
  const t = useTranslations("common");
  const isEn = locale === "en";

  // Lấy tối đa 5 thông báo mới nhất để hiển thị ở sidebar
  const activeNotices = notices.slice(0, 5);

  return (
    <div className="w-full space-y-6">
      {/* 1. Hero Slider (80% screen width, rounded corners) */}
      <div className="w-[92vw] lg:w-[80vw] max-w-[1360px] mx-auto mt-6 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 shadow-md">
        <HeroSlider banners={banners} />
      </div>

      {/* 2. Bảng Thông báo mới nhất (Đặt ngang tinh tế ngay bên dưới) */}
      <div className="max-w-[1360px] mx-auto px-6 pt-8 pb-4">
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <div className="space-y-6">
            {/* Header của bảng thông báo */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Bell size={18} className="text-brand-darkred shrink-0" />
                <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900">
                  {t("notices_title")}
                </h2>
              </div>

              <Link
                href={{ pathname: "/tin-tuc", query: { category_slug: "thong-bao" } }}
                className="flex items-center gap-1 text-xs font-bold text-brand-darkred hover:text-brand-darkred-dark transition-colors duration-150"
              >
                <span>{t("view_all")}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Danh sách thông báo dạng card lưới tinh tế */}
            {activeNotices.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm font-light">
                {isEn ? "No notifications available." : "Hiện chưa có thông báo nào mới."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {activeNotices.map((notice) => {
                  const title = isEn ? (notice.titleEn || notice.title) : notice.title;

                  return (
                    <Link
                      key={notice.id}
                      href={notice.href as ComponentProps<typeof Link>["href"]}
                      className="flex flex-col justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-brand-darkred/[0.02] hover:border-brand-darkred/25 transition-all duration-200 group"
                    >
                      <div className="space-y-2.5">
                        {/* Nhãn ngày tháng tinh giản */}
                        <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {notice.date}
                        </span>
                        
                        <h3 className="text-sm font-bold text-slate-700 leading-snug group-hover:text-brand-darkred line-clamp-3 transition-colors duration-150">
                          {title}
                        </h3>
                      </div>

                      <span className="text-brand-darkred text-[11px] font-bold mt-4 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {isEn ? "View details" : "Xem chi tiết"} &rarr;
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
