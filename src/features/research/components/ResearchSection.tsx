import { SafeImage } from "@/shared/components/ui/safe-image";
import { Link } from "@/i18n/routing";
import { FolderOpen, CalendarDays, ArrowRight, Pin } from "lucide-react";
import { useTranslations } from "next-intl";

interface ResearchArticleItem {
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

export function ResearchSection({
  articles = [],
  categorySlug = "nghien-cuu-khoa-hoc",
  hideHeader = false,
}: {
  articles: ResearchArticleItem[];
  categorySlug?: string;
  hideHeader?: boolean;
}) {
  const t = useTranslations("common");

  if (articles.length === 0) return null;

  // Tách bài viết đầu tiên làm tin nổi bật lớn bên trái (1/3 width)
  const bigArticle = articles[0];

  // Tách các bài viết tiếp theo làm danh sách tin phụ ở 2 cột bên phải (2/3 width)
  const subArticles = articles.slice(1);
  const midPoint = Math.ceil(subArticles.length / 2);
  const column1Articles = subArticles.slice(0, midPoint);
  const column2Articles = subArticles.slice(midPoint);

  return (
    <div className="space-y-6">
      {/* Tiêu đề Section */}
      {!hideHeader && (
        <div className="flex items-center justify-between gap-4">
          <h2 className="section-heading">
            {t("research_title")}
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

      {/* Grid Block-2: 1/3 bên trái là Tin lớn, 2/3 bên phải chia thành 2 cột chứa các tin nhỏ ngang */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cột trái (1/3): Bài viết lớn nổi bật */}
        {bigArticle && (
          <article className="group flex flex-col border border-border rounded-xl bg-white transition-all duration-300 hover:border-border-subtle hover:shadow-sm lg:col-span-1 overflow-hidden">
            {/* Ảnh đại diện lớn */}
            <Link
              href={bigArticle.href as any}
              className="relative block aspect-[16/10] overflow-hidden border-b border-slate-100 bg-slate-50"
            >
              <SafeImage
                src={bigArticle.imageUrl}
                alt={bigArticle.title}
                fill
                sizes="(max-width: 1023px) calc(100vw - 3rem), (max-width: 1359px) calc(33.33vw - 2rem), 421px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              {bigArticle.isPinned && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white">
                    <Pin size={8} className="fill-white" />
                    <span>Ghim</span>
                  </span>
                </div>
              )}
            </Link>

            {/* Nội dung bài viết lớn */}
            <div className="flex flex-1 flex-col space-y-2 p-6">
              <Link href={bigArticle.href as any}>
                <h3 className="group-hover:text-brand-darkred line-clamp-2 text-base leading-snug font-bold text-slate-900 transition-colors duration-200 sm:text-lg">
                  {bigArticle.title}
                </h3>
              </Link>
              {bigArticle.excerpt && (
                <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {bigArticle.excerpt}
                </p>
              )}

              {/* Meta info */}
              <div className="border-border-subtle mt-auto flex items-center justify-between border-t pt-3 text-xs font-medium text-slate-600">
                <Link
                  href={bigArticle.categoryHref as any}
                  className="text-brand-darkred flex max-w-[140px] items-center gap-1 truncate font-semibold"
                >
                  <FolderOpen size={11} className="text-slate-400" />
                  <span>{bigArticle.category}</span>
                </Link>
                <span className="flex items-center gap-1">
                  <CalendarDays size={11} />
                  <span>{bigArticle.date}</span>
                </span>
              </div>
            </div>
          </article>
        )}

        {/* 2/3 bên phải: Chia thành 2 cột phụ chứa danh sách tin nhỏ ngang */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
          {/* Cột phụ 1 */}
          <div className="space-y-4">
            {column1Articles.map((article) => (
              <div
                key={article.id}
                className="group flex gap-3.5 p-1.5 transition-colors duration-150 hover:bg-slate-50/50"
              >
                {/* Ảnh đại diện nhỏ 4:3 */}
                <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-border rounded-md bg-slate-50">
                  <SafeImage
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {/* Tiêu đề & meta */}
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <Link href={article.href as any}>
                    <h4 className="group-hover:text-brand-darkred line-clamp-2 text-sm leading-snug font-semibold text-slate-800 transition-colors duration-150">
                      {article.title}
                    </h4>
                  </Link>
                  <div className="mt-1 flex items-center justify-between text-xs font-medium text-slate-600">
                    <span className="text-brand-darkred max-w-[100px] truncate font-semibold">
                      {article.category}
                    </span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cột phụ 2 */}
          <div className="space-y-4">
            {column2Articles.map((article) => (
              <div
                key={article.id}
                className="group flex gap-3.5 p-1.5 transition-colors duration-150 hover:bg-slate-50/50"
              >
                {/* Ảnh đại diện nhỏ 4:3 */}
                <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-border rounded-md bg-slate-50">
                  <SafeImage
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {/* Tiêu đề & meta */}
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <Link href={article.href as any}>
                    <h4 className="group-hover:text-brand-darkred line-clamp-2 text-sm leading-snug font-semibold text-slate-800 transition-colors duration-150">
                      {article.title}
                    </h4>
                  </Link>
                  <div className="mt-1 flex items-center justify-between text-xs font-medium text-slate-600">
                    <span className="text-brand-darkred max-w-[100px] truncate font-semibold">
                      {article.category}
                    </span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
