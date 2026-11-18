import { Link } from "@/i18n/routing";
import { Calendar, ChevronRight, Clock, User } from "lucide-react";
import { ArticlePagination } from "@/features/article";
import { useTranslations } from "next-intl";

interface CalendarListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt: string; // Formatting handled by caller
  authorName?: string;
}

interface CalendarListProps {
  items: CalendarListItem[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function CalendarList({
  items,
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
}: CalendarListProps) {
  const t = useTranslations("calendar");

  return (
    <div className="space-y-8 bg-white p-6 sm:p-8 border border-slate-100/60 rounded-sm">
      {/* Header */}
      <div className="space-y-2 text-left pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-darkred/5 border border-brand-darkred/10 text-brand-darkred">
            <Calendar size={20} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {t("title")}
          </h1>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-100 bg-slate-50/50">
          <Calendar className="mx-auto h-12 w-12 text-slate-300" strokeWidth={1.5} />
          <h3 className="mt-4 text-sm font-semibold text-slate-700">{t("no_schedule")}</h3>
        </div>
      ) : (
        /* List Items */
        <div className="divide-y divide-slate-100 border border-slate-100/60">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-all duration-150 group"
            >
              {/* Left Side: Info */}
              <div className="space-y-2 flex-1">
                <Link
                  href={`/lich-tuan/${item.slug}`}
                  className="block text-base font-bold text-slate-800 hover:text-brand-darkred group-hover:text-brand-darkred transition-colors duration-150 leading-snug"
                >
                  {item.title}
                </Link>

                {/* Excerpt/Date Range */}
                {item.excerpt && (
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {item.excerpt}
                  </p>
                )}

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{item.publishedAt}</span>
                  </span>
                  {item.authorName && (
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      <span>{item.authorName}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side: Action Button */}
              <div className="shrink-0 flex items-center">
                <Link
                  href={`/lich-tuan/${item.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-white bg-slate-50 hover:bg-brand-darkred border border-slate-100/60 hover:border-brand-darkred transition-all duration-200 rounded-sm cursor-pointer group/btn "
                >
                  <span>{t("view_all")}</span>
                  <ChevronRight size={13} className="transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-6 flex justify-center">
          <ArticlePagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        </div>
      )}
    </div>
  );
}
