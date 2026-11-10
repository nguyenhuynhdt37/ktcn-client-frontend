import { SafeImage } from "@/shared/components/ui/safe-image";
import { Link } from "@/i18n/routing";
import { FolderOpen, CalendarDays, ArrowRight, Pin } from "lucide-react";
import { useTranslations } from "next-intl";

export interface ArticleItem {
  id: string | number;
  title: string;
  excerpt?: string;
  imageUrl: string;
  category: string;
  categoryHref: string;
  date: string;
  href: string;
  isPinned?: boolean;
}

const defaultArticles: ArticleItem[] = [];

export function NewsSection({
  articles = defaultArticles,
  categorySlug,
  hideHeader = false,
  title,
}: {
  articles?: ArticleItem[];
  categorySlug?: string;
  hideHeader?: boolean;
  title?: string;
}) {
  const t = useTranslations("common");
  const tArticle = useTranslations("article");

  if (articles.length === 0) return null;

  const displayTitle = title || tArticle("title");

  return (
    <div className="space-y-6">
      {/* Tiêu đề Section */}
      {!hideHeader && (
        <div className="flex items-center justify-between gap-4">
          <h2 className="section-heading">{displayTitle}</h2>
          <Link
            href={categorySlug ? (`/tin-tuc?category_slug=${categorySlug}` as any) : "/tin-tuc"}
            className="group text-brand-darkred hover:bg-brand-darkred/5 hover:text-brand-darkred-dark inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-semibold transition-colors duration-150"
          >
            <span>{t("view_all")}</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      )}

      {/* Grid 3 card đứng đều nhau, khoảng cách thoáng đạt, sang trọng */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <article
            key={article.id}
            className="group border-border hover:border-brand-blue/25 flex flex-col overflow-hidden rounded-xl border bg-white transition-[border-color,transform] duration-200 hover:-translate-y-0.5"
          >
            {/* Ảnh đại diện */}
            <Link
              href={article.href as any}
              className="border-border-subtle bg-surface relative block aspect-[16/10] overflow-hidden border-b"
            >
              <SafeImage
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1359px) calc(33.33vw - 2rem), 421px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              {article.isPinned && (
                <div className="absolute top-3 left-3 z-10 select-none">
                  <span className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white">
                    <Pin size={12} className="fill-white" aria-hidden="true" />
                    <span>Ghim</span>
                  </span>
                </div>
              )}
            </Link>

            {/* Nội dung card */}
            <div className="flex flex-1 flex-col space-y-3 p-6">
              <Link href={article.href as any}>
                <h3 className="group-hover:text-brand-darkred line-clamp-3 text-base leading-snug font-semibold text-slate-800 transition-colors duration-150">
                  {article.title}
                </h3>
              </Link>
              {article.excerpt && (
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {article.excerpt}
                </p>
              )}

              {/* Meta info */}
              <div className="border-border-subtle mt-auto flex items-center justify-between gap-3 border-t pt-4 text-xs font-medium text-slate-600">
                <Link
                  href={article.categoryHref as any}
                  className="text-brand-darkred flex max-w-[140px] items-center gap-1.5 truncate"
                >
                  <FolderOpen size={14} className="text-brand-darkred/70" aria-hidden="true" />
                  <span>{article.category}</span>
                </Link>
                <span className="flex items-center gap-1">
                  <CalendarDays size={14} aria-hidden="true" />
                  <span>{article.date}</span>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
