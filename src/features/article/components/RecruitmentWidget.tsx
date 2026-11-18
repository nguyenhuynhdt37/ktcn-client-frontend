import { Link } from "@/i18n/routing";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface RecruitmentItem {
  id: string;
  title: string;
  date: string;
  href: string;
}

export function RecruitmentWidget({
  items = [],
  categorySlug = "tuyen-dung",
}: {
  items: RecruitmentItem[];
  categorySlug?: string;
}) {
  const t = useTranslations("common");

  if (items.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="after:bg-brand-darkred relative text-xl font-bold tracking-tight text-slate-800 after:absolute after:bottom-[-17px] after:left-0 after:h-[2px] after:w-16 sm:text-2xl">
          {t("recruitment_title")}
        </h2>
        <Link
          href={`/tin-tuc?category_slug=${categorySlug}`}
          className="text-brand-darkred hover:text-brand-darkred-dark group flex items-center gap-1 text-xs font-bold transition-colors duration-200"
        >
          <span>{t("view_all")}</span>
          <ArrowRight
            size={12}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="group py-3 first:pt-0">
            <Link
              href={item.href}
              className="block space-y-1.5 rounded-none py-1 transition-colors duration-150 hover:bg-slate-50/80"
            >
              <h3 className="group-hover:text-brand-darkred line-clamp-2 text-sm leading-snug font-bold text-slate-800 transition-colors duration-200">
                {item.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <CalendarDays size={11} />
                <span>{item.date}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
