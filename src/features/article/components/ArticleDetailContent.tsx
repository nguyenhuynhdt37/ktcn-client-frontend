import Image from "next/image";
import { Link } from "@/i18n/routing";
import { CalendarDays, Clock, User, Eye } from "lucide-react";
import { PortalArticleDetail, PortalArticleListResponse } from "../types/article.types";
import { getLocalizedField, formatDate } from "../utils/map-article";
import { getTranslations } from "next-intl/server";
import { Breadcrumb, BreadcrumbItem } from "@/shared/components/ui/breadcrumb";
import { TableOfContents } from "./TableOfContents";
import { HeadingItem } from "../utils/parse-headings";
import { sanitizeRichHtml } from "@/shared/lib/security";

interface ArticleDetailContentProps {
  article: PortalArticleDetail;
  locale: string;
  cleanHtml: string;
  headings: HeadingItem[];
  sidebarNews: PortalArticleListResponse[];
  relatedNews: PortalArticleListResponse[];
}

export async function ArticleDetailContent({
  article,
  locale,
  cleanHtml,
  headings,
  sidebarNews,
  relatedNews,
}: ArticleDetailContentProps) {
  const isEn = locale === "en";
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tArticle = await getTranslations({ locale, namespace: "article" });

  const title = getLocalizedField<string>(article, "title", locale);
  const excerpt = getLocalizedField<string>(article, "excerpt", locale);
  const categoryName = getLocalizedField<string>(article.category, "name", locale);

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: tCommon("home"), href: "/" },
    { name: categoryName, href: `/tin-tuc?category=${article.category.slug}` },
    { name: title }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-14 md:py-20">
      <div className="max-w-[1360px] mx-auto px-6 space-y-6">

        {/* Breadcrumb điều hướng */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Bố cục chính */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

          {/* Cột trái lơ lửng ngoài lề: Chỉ hiện trên màn hình rộng min-width 1600px */}
          {headings.length > 0 && (
            <div className="hidden min-[1600px]:block absolute right-full mr-8 top-0 bottom-0 w-60">
              <aside className="sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
                <TableOfContents
                  headings={headings}
                  variant="sidebar"
                  title={isEn ? "Table of Contents" : "Mục lục nội dung"}
                />
              </aside>
            </div>
          )}

          {/* Cột bài viết (luôn rộng full 9/12 trên desktop để bài viết rộng rãi) */}
          <main className="lg:col-span-9">
            <article className="bg-white p-6 sm:p-10 border border-slate-100/60 rounded-sm space-y-6">

              {/* Tiêu đề & Meta Info */}
              <div className="space-y-4 border-b border-slate-100 pb-6">
                <span className="inline-block bg-brand-darkred/10 text-brand-darkred text-xs font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm">
                  {categoryName}
                </span>

                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold font-serif text-slate-900 leading-snug">
                  {title}
                </h1>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-600 pt-2 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User size={16} className="text-slate-400" />
                    <span className="text-slate-700">
                      {article.author.full_name || article.author.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={16} className="text-slate-400" />
                    <span>{formatDate(article.published_at, locale)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-slate-400" />
                    <span>{article.reading_time} {isEn ? "mins read" : "phút đọc"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye size={16} className="text-slate-400" />
                    <span>{article.view_count} {tArticle("views")}</span>
                  </div>
                </div>
              </div>

              {/* Excerpt (Tóm tắt) nếu có */}
              {excerpt && (
                <p className="text-base sm:text-lg text-slate-600 font-medium italic border-l-4 border-brand-darkred pl-4 py-1 leading-relaxed">
                  {excerpt}
                </p>
              )}

              {/* Cover Image */}
              {article.cover_url && (
                <div className="relative w-full h-[250px] sm:h-[400px] lg:h-[480px] overflow-hidden bg-slate-100 border border-slate-100/60 rounded-sm">
                  <Image
                    src={article.cover_url}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 896px"
                  />
                </div>
              )}

              {/* Mục lục bài viết (chỉ hiện ở đầu nội dung trên mobile/tablet/laptop và ẩn trên màn hình cực lớn min-1600px) */}
              {headings.length > 0 && (
                <TableOfContents
                  headings={headings}
                  variant="inline"
                  title={isEn ? "Table of Contents" : "Mục lục nội dung"}
                  expandText={isEn ? "Show" : "Hiện"}
                  collapseText={isEn ? "Hide" : "Ẩn"}
                  className="min-[1600px]:hidden"
                />
              )}

              {/* Content (Nội dung chi tiết HTML từ Backend - Đã áp dụng CSS class rich-text-content chuyên biệt) */}
              <div
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(cleanHtml) }}
              />

              {/* Danh sách Tags nhãn bài viết */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Tags:</span>
                  {article.tags.map((tag) => {
                    const tagName = getLocalizedField<string>(tag, "name", locale);
                    return (
                      <Link
                        key={tag.id}
                        href={{ pathname: "/tin-tuc", query: { tag: tag.slug } }}
                        className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-brand-darkred hover:text-white px-3 py-1.5 transition duration-150 rounded-sm border border-slate-100/60"
                      >
                        {tagName}
                      </Link>
                    );
                  })}
                </div>
              )}
            </article>
          </main>

          {/* Cột phải (3/12): Sidebar các danh mục tin phụ */}
          <aside className="lg:col-span-3 space-y-6">

            {/* Widget 1: Tin mới nhất */}
            {sidebarNews.length > 0 && (
              <div className="bg-white p-6 border border-slate-100/60 rounded-sm space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                    {isEn ? "Latest News" : "Tin tức mới nhất"}
                  </h3>
                </div>

                <ul className="divide-y divide-slate-100">
                  {sidebarNews.map((item) => {
                    const itemTitle = getLocalizedField<string>(item, "title", locale);
                    const itemCatName = getLocalizedField<string>(item.category, "name", locale);
                    return (
                      <li key={item.id} className="py-4 first:pt-0 last:pb-0 group">
                        <Link href={{ pathname: "/tin-tuc/[slug]", params: { slug: item.slug } }} className="block space-y-1.5">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-brand-darkred transition leading-snug line-clamp-2">
                            {itemTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 font-medium">
                            <span className="text-brand-darkred font-bold uppercase text-[10px]">{itemCatName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <CalendarDays size={11} />
                              <span>{formatDate(item.published_at, locale)}</span>
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href="/tin-tuc"
                  className="block text-center text-xs font-bold text-brand-darkred hover:underline pt-2 border-t border-slate-50"
                >
                  {isEn ? "View all news" : "Xem tất cả tin tức"} &rarr;
                </Link>
              </div>
            )}

            {/* Widget 2: Bài viết liên quan */}
            {relatedNews.length > 0 && (
              <div className="bg-white p-6 border border-slate-100/60 rounded-sm space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                    {isEn ? "Related Articles" : "Bài viết liên quan"}
                  </h3>
                </div>

                <ul className="divide-y divide-slate-100">
                  {relatedNews.map((item) => {
                    const itemTitle = getLocalizedField<string>(item, "title", locale);
                    const itemCatName = getLocalizedField<string>(item.category, "name", locale);
                    return (
                      <li key={item.id} className="py-4 first:pt-0 last:pb-0 group">
                        <Link href={{ pathname: "/tin-tuc/[slug]", params: { slug: item.slug } }} className="block space-y-1.5">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-brand-darkred transition leading-snug line-clamp-2">
                            {itemTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 font-medium">
                            <span className="text-brand-darkred font-bold uppercase text-[10px]">{itemCatName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <CalendarDays size={11} />
                              <span>{formatDate(item.published_at, locale)}</span>
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href={{ pathname: "/tin-tuc", query: { category_slug: article.category.slug } }}
                  className="block text-center text-xs font-bold text-brand-darkred hover:underline pt-2 border-t border-slate-50"
                >
                  {isEn ? `More from ${categoryName}` : `Xem thêm ${categoryName}`} &rarr;
                </Link>
              </div>
            )}
          </aside>

        </div>

      </div>
    </div>
  );
}
