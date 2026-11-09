import { VisitorStatistics } from "./footer/visitor-statistics";
import { ContactInformation } from "./footer/contact-information";
import { QuickLinks } from "./footer/quick-links";
import { ExternalLinks } from "./footer/external-links";
import { FacebookFanpage } from "./footer/facebook-fanpage";
import { Copyright } from "./footer/copyright";
import type { MenuTreeResponse } from "@/features/menu/types/menu.types";
import { resolveMenuUrl } from "@/features/menu/utils/resolve-menu-url";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";

interface FooterProps {
  initialMenu?: MenuTreeResponse | null;
}

export function Footer({ initialMenu }: FooterProps) {
  const locale = useLocale();
  const hasDynamicMenu = initialMenu && initialMenu.items && initialMenu.items.length > 0;

  return (
    <footer
      id="footer"
      className="border-border bg-section-alt mt-auto border-t text-sm text-slate-700"
    >
      {/* 1. Thống kê truy cập */}
      <VisitorStatistics />

      {/* 2. Nội dung chính Footer */}
      <div className="site-container py-14 sm:py-16">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Cột 1: Thông tin liên hệ (Chiếm 40% = 2/5 cột) */}
          <div className="lg:col-span-2">
            <ContactInformation />
          </div>

          {/* Dịch các cột menu động từ Backend (nếu có cấu hình), nếu không dùng dữ liệu dự phòng cứng */}
          {hasDynamicMenu ? (
            <>
              {initialMenu.items.slice(0, 2).map((column) => (
                <div key={column.id} className="lg:col-span-1 space-y-5">
                  <div className="text-base font-bold text-slate-900">{column.title}</div>
                  <ul className="space-y-2">
                    {column.children?.map((child) => {
                      const url = resolveMenuUrl(child, locale);
                      const isExternal = child.target_type === "EXTERNAL_LINK";
                      return (
                        <li key={child.id}>
                          {isExternal ? (
                            <a
                              href={url}
                              target={child.open_in_new_tab ? "_blank" : undefined}
                              rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                              className="hover:text-brand-darkred flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 transition-colors duration-150"
                            >
                              <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
                              {child.title}
                            </a>
                          ) : (
                            <Link
                              href={url as any}
                              target={child.open_in_new_tab ? "_blank" : undefined}
                              className="hover:text-brand-darkred flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 transition-colors duration-150"
                            >
                              <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
                              {child.title}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {/* Giữ bố cục cân đối khi chỉ có 1 cột */}
              {initialMenu.items.length === 1 && <div className="hidden lg:block lg:col-span-1" />}
            </>
          ) : (
            <>
              {/* Cột 2: Thông tin / Liên kết nhanh (Chiếm 20% = 1/5 cột) */}
              <div className="lg:col-span-1">
                <QuickLinks />
              </div>

              {/* Cột 3: Liên kết ngoài (Chiếm 20% = 1/5 cột) */}
              <div className="lg:col-span-1">
                <ExternalLinks />
              </div>
            </>
          )}

          {/* Cột 4: Facebook Fanpage (Chiếm 20% = 1/5 cột) */}
          <div className="lg:col-span-1">
            <FacebookFanpage />
          </div>
        </div>
      </div>

      {/* 3. Copyright Bar */}
      <Copyright />
    </footer>
  );
}
