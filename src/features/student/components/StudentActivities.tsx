import { SafeImage } from "@/shared/components/ui/safe-image";
import { Link } from "@/i18n/routing";
import { FolderOpen, CalendarDays, ArrowRight, Pin } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface ActivityItem {
  id: string | number;
  title: string;
  titleEn?: string;
  imageUrl: string;
  category: string;
  categoryEn?: string;
  categoryHref: string;
  date: string;
  href: string;
  isPinned?: boolean;
}

const defaultActivities: ActivityItem[] = [];

export function StudentActivities({
  activities = defaultActivities,
  categorySlug = "sinh-vien",
  hideHeader = false,
}: {
  activities?: ActivityItem[];
  categorySlug?: string;
  hideHeader?: boolean;
}) {
  const t = useTranslations("common");
  const locale = useLocale();

  if (activities.length === 0) return null;

  return (
    <section className="border-y border-slate-200/50 bg-slate-50/60 py-12">
      <div className="mx-auto max-w-[1360px] space-y-6 px-6">
        {!hideHeader && (
          <div className="flex items-center justify-between gap-4">
            <h2 className="section-heading">
              {t("student_activities_title")}
            </h2>
            <Link
              href={`/tin-tuc?category_slug=${categorySlug}` as any}
              className="group text-brand-darkred hover:bg-brand-darkred/5 hover:text-brand-darkred-dark inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold transition-colors duration-150"
            >
              <span>{t("view_all")}</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((item) => {
            const title = locale === "en" ? item.titleEn || item.title : item.title;
            const category = locale === "en" ? item.categoryEn || item.category : item.category;
            return (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all duration-300 hover:border-border-subtle hover:shadow-sm"
              >
                <Link
                  href={item.href as any}
                  className="relative block aspect-[16/10] overflow-hidden border-b border-slate-100 bg-slate-50"
                >
                  <SafeImage
                    src={item.imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 639px) calc(100vw - 3rem), (max-width: 1023px) calc(50vw - 2.25rem), (max-width: 1359px) calc(25vw - 1.875rem), 310px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />

                  {/* Badge ghim */}
                  {item.isPinned && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white">
                        <Pin size={8} className="fill-white" />
                        <span>Ghim</span>
                      </span>
                    </div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col space-y-2 p-4.5">
                  <Link href={item.href as any}>
                    <h3 className="group-hover:text-brand-darkred line-clamp-3 text-sm leading-snug font-bold text-slate-800 transition-colors duration-200">
                      {title}
                    </h3>
                  </Link>
                  <div className="border-border-subtle mt-auto flex items-center justify-between border-t pt-3 text-xs font-medium text-slate-600">
                    <Link
                      href={item.categoryHref as any}
                      className="hover:text-brand-darkred flex max-w-[120px] items-center gap-1 truncate font-semibold text-slate-600 transition-colors duration-150"
                    >
                      <FolderOpen size={11} className="text-slate-400" />
                      <span>{category}</span>
                    </Link>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={11} />
                      <span>{item.date}</span>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
