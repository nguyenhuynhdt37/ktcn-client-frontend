"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { FolderOpen, CalendarDays, Eye, Tag as TagIcon, User, Pin } from "lucide-react";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { PortalArticleResponse, PortalArticleListResponse } from "../types/article.types";
import { formatDate, getLocalizedField } from "../utils/map-article";

interface ArticleCardProps {
  article: PortalArticleResponse | PortalArticleListResponse;
  priority?: boolean;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  const locale = useLocale();
  const tArticle = useTranslations("article");

  // Backend trả về Full URL tuyệt đối trong thumbnail_object_key, sử dụng trực tiếp
  const imageUrl = article.thumbnail_object_key || "/images/no-image-dhv.jpg";
  const articleHref = { pathname: "/tin-tuc/[slug]" as const, params: { slug: article.slug } };

  // Lấy các trường dịch động
  const title = getLocalizedField<string>(article, "title", locale);
  const excerpt = getLocalizedField<string>(article, "excerpt", locale);
  const categoryName = getLocalizedField<string>(article.category, "name", locale);

  return (
    <article className="group border-border hover:border-brand-blue/25 mb-5 flex flex-col gap-5 rounded-xl border bg-white p-6 transition-[border-color,transform] duration-200 last:mb-0 hover:-translate-y-0.5 sm:flex-row sm:gap-6 sm:p-8">
      {/* Khung ảnh bên trái */}
      <div className="bg-surface relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg sm:w-56">
        <Link href={articleHref} className="relative block h-full w-full">
          <SafeImage
            src={imageUrl}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 240px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Badge Ghim góc trên ảnh với fallback an toàn cho i18n */}
        {article.is_pinned && (
          <div className="absolute top-2.5 left-2.5 z-10 select-none">
            <span className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white">
              <Pin size={12} className="rotate-[30deg] fill-white" aria-hidden="true" />
              <span>{tArticle("pinned") || (locale === "en" ? "Pinned" : "Ghim")}</span>
            </span>
          </div>
        )}
      </div>

      {/* Nội dung bên phải */}
      <div className="flex min-w-0 flex-1 flex-col justify-between space-y-3 py-0.5">
        <div className="space-y-2.5">
          {/* Tiêu đề bài viết */}
          <Link href={articleHref}>
            <h3 className="group-hover:text-brand-darkred line-clamp-2 text-lg leading-snug font-semibold text-slate-800 transition-colors duration-150">
              {title}
            </h3>
          </Link>

          {/* Tóm tắt Sapo */}
          {excerpt && (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 sm:line-clamp-3">
              {excerpt}
            </p>
          )}
        </div>

        {/* Thông tin metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-600">
          {/* Chuyên mục */}
          {article.category && (
            <Link
              href={`/tin-tuc?category_slug=${article.category.slug}` as any}
              className="bg-brand-darkred/5 text-brand-darkred hover:text-brand-darkred-dark flex min-h-8 items-center gap-1.5 rounded-md px-2 font-semibold transition-colors duration-150"
            >
              <FolderOpen size={14} className="text-brand-darkred/70" aria-hidden="true" />
              <span>{categoryName}</span>
            </Link>
          )}

          {/* Tác giả */}
          {article.author && (
            <Link
              href={`/tin-tuc?author_username=${article.author.username}` as any}
              className="bg-surface hover:text-brand-darkred flex min-h-8 items-center gap-1.5 rounded-md px-2 font-medium text-slate-600 transition-colors duration-150"
            >
              <User size={14} className="text-slate-600" aria-hidden="true" />
              <span>{article.author.full_name || article.author.username}</span>
            </Link>
          )}

          {/* Ngày đăng */}
          <span className="bg-surface flex min-h-8 items-center gap-1.5 rounded-md px-2 text-slate-600">
            <CalendarDays size={14} aria-hidden="true" />
            <span>
              {formatDate(article.published_at || article.publish_at || article.created_at, locale)}
            </span>
          </span>

          {/* Lượt xem */}
          <span className="bg-surface flex min-h-8 items-center gap-1.5 rounded-md px-2 text-slate-600">
            <Eye size={14} aria-hidden="true" />
            <span>
              {article.view_count} {tArticle("views")}
            </span>
          </span>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="ml-auto flex flex-wrap gap-1.5 sm:ml-4">
              {article.tags.slice(0, 2).map((t) => {
                const tagName = getLocalizedField<string>(t, "name", locale);
                return (
                  <Link
                    key={t.slug}
                    href={`/tin-tuc?tag_slug=${t.slug}` as any}
                    className="border-border bg-surface hover:bg-surface-hover flex min-h-8 items-center gap-1 rounded-md border px-2 text-xs font-medium text-slate-600 transition-colors duration-150"
                    style={t.color ? { color: t.color, borderColor: `${t.color}30` } : undefined}
                  >
                    <TagIcon size={13} aria-hidden="true" />
                    <span>{tagName}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
