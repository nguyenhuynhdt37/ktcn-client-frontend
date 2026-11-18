"use client";

import { Calendar, Mail, BookOpen, UserCheck, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface ServiceItem {
  titleKey: string;
  href: string;
  icon: React.ReactNode;
}

const defaultServices: ServiceItem[] = [
  {
    titleKey: "weekly_schedule",
    href: "/lich-tuan",
    icon: <Calendar className="text-brand-blue h-5 w-5" />,
  },
  {
    titleKey: "email",
    href: "https://outlook.office.com/",
    icon: <Mail className="text-brand-blue h-5 w-5" />,
  },
  {
    titleKey: "elearning",
    href: "https://elearning.vinhuni.edu.vn/",
    icon: <BookOpen className="text-brand-blue h-5 w-5" />,
  },
  {
    titleKey: "tuyen_sinh_2026",
    href: "https://tuyensinhchinhquy.vinhuni.edu.vn/",
    icon: <GraduationCap className="text-brand-blue h-5 w-5" />,
  },
  {
    titleKey: "staff_portal",
    href: "https://canbo.vinhuni.edu.vn/",
    icon: <UserCheck className="text-brand-blue h-5 w-5" />,
  },
  {
    titleKey: "smart_uni",
    href: "https://usmart.vinhuni.edu.vn/",
    icon: <GraduationCap className="text-brand-blue h-5 w-5" />,
  },
];

export function ServicesBar({ services = defaultServices }: { services?: ServiceItem[] }) {
  const t = useTranslations("services");

  return (
    <section
      className="border-border bg-section-alt border-y py-6 sm:py-8"
      aria-label="Truy cập nhanh"
    >
      <div className="site-container">
        <div className="border-border bg-border grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-3 lg:grid-cols-6">
          {services.map((service) => {
            const isExternal = service.href.startsWith("http");
            const title = t(service.titleKey);

            const cardClasses =
              "group flex min-h-28 flex-col items-center justify-center bg-white p-4 text-center transition-colors duration-150 hover:bg-surface";

            if (isExternal) {
              return (
                <a
                  key={service.titleKey}
                  href={service.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClasses}
                >
                  <div className="bg-brand-blue/8 group-hover:bg-brand-blue/12 flex size-11 items-center justify-center rounded-lg transition-colors duration-150">
                    {service.icon}
                  </div>
                  <h4 className="group-hover:text-brand-blue mt-2.5 text-sm font-semibold text-slate-700 transition-colors duration-150">
                    {title}
                  </h4>
                </a>
              );
            }

            return (
              <Link key={service.titleKey} href={service.href} className={cardClasses}>
                <div className="bg-brand-blue/8 group-hover:bg-brand-blue/12 flex size-11 items-center justify-center rounded-lg transition-colors duration-150">
                  {service.icon}
                </div>
                <h4 className="group-hover:text-brand-blue mt-2.5 text-sm font-semibold text-slate-700 transition-colors duration-150">
                  {title}
                </h4>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
