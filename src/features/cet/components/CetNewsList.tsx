import { CalendarDays, Newspaper } from "lucide-react";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { getLocalizedField, formatDate } from "@/features/article/utils/map-article";
import type { PortalArticleListResponse } from "@/features/article/types/article.types";
import type { CetNewsData, CetNewsFilters } from "../services/news-data";
import { isAllPillActive, pageNumbers, sentenceCaseTitle } from "../utils/inner";
import { CetLink } from "./CetLink";
import { CetPageHeader } from "./CetPageHeader";
import { CetSideCard } from "./CetSideCard";
import base from "../cet.module.css";
import styles from "../cet-inner.module.css";

function newsHref(params: { q?: string; category?: string; tag?: string; page?: number }): string {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category) query.set("category_slug", params.category);
  if (params.tag) query.set("tag_slug", params.tag);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const search = query.toString();
  return search ? `/tin-tuc?${search}` : "/tin-tuc";
}

function pageHref(filters: CetNewsFilters, page: number): string {
  return newsHref({ q: filters.q, category: filters.category, tag: filters.tag, page });
}

function NewsCard({ item, locale }: { item: PortalArticleListResponse; locale: string }) {
  const title = getLocalizedField<string>(item, "title", locale);
  const excerpt = getLocalizedField<string>(item, "excerpt", locale);
  const href = `/tin-tuc/${item.slug}`;
  return (
    <article className={base.newsCard}>
      <CetLink
        className={
          item.thumbnail_object_key ? base.thumbnail : `${base.thumbnail} ${styles.placeholderThumb}`
        }
        href={href}
        locale={locale}
        tabIndex={-1}
        aria-hidden="true"
      >
        {item.thumbnail_object_key ? (
          <SafeImage
            src={item.thumbnail_object_key}
            fallbackSrc="/images/no-image-dhv.jpg"
            alt=""
            fill
            sizes="(min-width: 992px) 400px, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <Newspaper size={44} strokeWidth={1.5} aria-hidden="true" />
        )}
      </CetLink>
      <div className={base.newsBody}>
        {item.category?.slug && (
          <CetLink
            className={`${base.tag} ${styles.cardTag}`}
            href={newsHref({ category: item.category.slug })}
            locale={locale}
          >
            {getLocalizedField<string>(item.category, "name", locale)}
          </CetLink>
        )}
        <h3>
          <CetLink href={href} locale={locale}>
            {title}
          </CetLink>
        </h3>
        {excerpt && <p>{excerpt}</p>}
        <time dateTime={item.published_at}>
          <CalendarDays size={14} aria-hidden="true" />
          {formatDate(item.published_at, locale)}
        </time>
      </div>
    </article>
  );
}

export function CetNewsList({ data, locale }: { data: CetNewsData; locale: string }) {
  const isEn = locale === "en";
  const { articles, filters, pills, popular, page, totalPages } = data;
  const hasQuery = Boolean(filters.q);
  const title = hasQuery
    ? isEn
      ? `Search results for "${filters.q}"`
      : `Kết quả tìm kiếm cho "${filters.q}"`
    : isEn
      ? "News & events"
      : "Tin tức & sự kiện";
  const crumbs = [{ label: isEn ? "News" : "Tin tức" }];
  const quickLinks = [
    { title: isEn ? "Weekly calendar" : "Lịch tuần", href: "/lich-tuan" },
    {
      title: isEn ? "Documents & forms" : "Văn bản – Biểu mẫu",
      href: "/tai-lieu/van-ban-bieu-mau",
    },
    {
      title: isEn ? "Scholarships" : "Học bổng",
      href: "/tin-tuc?category_slug=thong-tin-hoc-bong",
    },
  ];
  const showPagination = totalPages > 1;
  const allActive = isAllPillActive(filters);
  const activeTagName = filters.tag
    ? articles
        .flatMap((item) => item.tags ?? [])
        .map((tag) => (tag.slug === filters.tag ? getLocalizedField<string>(tag, "name", locale) : ""))
        .find(Boolean) || filters.tag
    : "";

  return (
    <>
      <CetPageHeader title={title} crumbs={crumbs} locale={locale} />
      <div className={`${base.container} ${styles.layout}`}>
        <div>
          <nav aria-label={isEn ? "News categories" : "Chuyên mục tin tức"}>
            <ul className={styles.pillRow}>
              <li>
                <CetLink
                  className={`${styles.pill} ${allActive ? styles.pillActive : ""}`}
                  href={newsHref({ q: filters.q })}
                  locale={locale}
                  aria-current={allActive ? "page" : undefined}
                >
                  {isEn ? "All" : "Tất cả"}
                </CetLink>
              </li>
              {pills.map((pill) => {
                const active = pill.slug === filters.category;
                return (
                  <li key={pill.slug}>
                    <CetLink
                      className={`${styles.pill} ${active ? styles.pillActive : ""}`}
                      href={newsHref({ q: filters.q, category: pill.slug })}
                      locale={locale}
                      aria-current={active ? "page" : undefined}
                    >
                      {pill.name}
                    </CetLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {filters.tag && (
            <p className={styles.activeFilter}>
              <span>
                {isEn ? "Tag" : "Thẻ"}: <strong>{activeTagName}</strong>
              </span>
              <CetLink href={newsHref({ q: filters.q })} locale={locale}>
                {isEn ? "Clear filter" : "Xóa bộ lọc"}
              </CetLink>
            </p>
          )}

          <h2 className={styles.visuallyHidden}>{isEn ? "Articles" : "Danh sách tin"}</h2>

          {articles.length > 0 ? (
            <>
              <ul className={styles.newsList}>
                {articles.map((item) => (
                  <li key={item.id}>
                    <NewsCard item={item} locale={locale} />
                  </li>
                ))}
              </ul>
              {showPagination && (
                <nav className={styles.pagination} aria-label={isEn ? "Pagination" : "Phân trang"}>
                  <ul className={styles.paginationList}>
                    {pageNumbers(page, totalPages).map((entry, index) => (
                      <li key={`${index}-${entry}`}>
                        {entry === "…" ? (
                          <span className={styles.pageEllipsis} aria-hidden="true">
                            …
                          </span>
                        ) : entry === page ? (
                          <span
                            className={`${styles.pageLink} ${styles.pageCurrent}`}
                            aria-current="page"
                            aria-label={isEn ? `Page ${entry}, current page` : `Trang ${entry}, trang hiện tại`}
                          >
                            {entry}
                          </span>
                        ) : (
                          <CetLink
                            className={styles.pageLink}
                            href={pageHref(filters, entry)}
                            locale={locale}
                            aria-label={isEn ? `Page ${entry}` : `Trang ${entry}`}
                          >
                            {entry}
                          </CetLink>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className={styles.emptyState} role={data.unavailable ? "status" : undefined}>
              <p>
                {data.unavailable
                  ? isEn
                    ? "Articles are temporarily unavailable. Please try again later."
                    : "Danh sách bài viết tạm thời chưa tải được. Vui lòng thử lại sau."
                  : isEn
                    ? "No articles match your search."
                    : "Không tìm thấy bài viết phù hợp."}
              </p>
              <CetLink href="/tin-tuc" locale={locale}>
                {isEn ? "Back to all news" : "Quay lại tất cả tin tức"}
              </CetLink>
            </div>
          )}
        </div>

        <aside aria-label={isEn ? "Sidebar" : "Thanh bên"}>
          {popular.length > 0 && (
            <CetSideCard title={isEn ? "Most read" : "Đọc nhiều"}>
              <ul className={styles.sideList}>
                {popular.map((item) => (
                  <li key={item.id}>
                    <CetLink
                      className={styles.sideItem}
                      href={`/tin-tuc/${item.slug}`}
                      locale={locale}
                    >
                      <span>
                        {sentenceCaseTitle(getLocalizedField<string>(item, "title", locale), locale)}
                      </span>
                      {item.published_at && (
                        <time className={styles.sideDate} dateTime={item.published_at}>
                          <CalendarDays size={12} aria-hidden="true" />
                          {formatDate(item.published_at, locale)}
                        </time>
                      )}
                    </CetLink>
                  </li>
                ))}
              </ul>
            </CetSideCard>
          )}
          <CetSideCard title={isEn ? "Quick links" : "Liên kết nhanh"}>
            <ul className={styles.sideList}>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <CetLink href={link.href} locale={locale}>
                    {link.title}
                  </CetLink>
                </li>
              ))}
            </ul>
          </CetSideCard>
        </aside>
      </div>
    </>
  );
}
