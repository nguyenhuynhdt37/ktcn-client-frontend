import Image from "next/image";
import { CalendarDays, Eye, Mail, Share2, User } from "lucide-react";
import { getLocalizedField, formatDate } from "@/features/article/utils/map-article";
import { sentenceCaseTitle } from "../utils/inner";
import type {
  PortalArticleDetail,
  PortalArticleListResponse,
} from "@/features/article/types/article.types";
import { CetLink } from "./CetLink";
import { CetPageHeader } from "./CetPageHeader";
import { CetSideCard } from "./CetSideCard";
import base from "../cet.module.css";
import styles from "../cet-inner.module.css";

const ABOUT_CATEGORY_SLUGS = ["gioi-thieu", "lich-su-phat-trien", "chuc-nang-nhiem-vu"];

export function CetArticleDetail({
  article,
  related,
  cleanHtml,
  locale,
  shareUrl,
}: {
  article: PortalArticleDetail;
  related: PortalArticleListResponse[];
  cleanHtml: string;
  locale: string;
  shareUrl: string;
}) {
  const isEn = locale === "en";
  const title = sentenceCaseTitle(getLocalizedField<string>(article, "title", locale), locale);
  const excerpt = getLocalizedField<string>(article, "excerpt", locale);
  const categoryName = article.category
    ? getLocalizedField<string>(article.category, "name", locale)
    : "";
  const author = article.author?.full_name || article.author?.username || "";
  const views =
    typeof article.view_count === "number" && article.view_count > 0 ? article.view_count : 0;
  const tags = article.tags ?? [];
  const isAbout = ABOUT_CATEGORY_SLUGS.includes(article.category?.slug ?? "");
  const crumbs = [
    isAbout
      ? { label: isEn ? "About" : "Giới thiệu", href: "/gioi-thieu" }
      : { label: isEn ? "News" : "Tin tức", href: "/tin-tuc" },
    { label: isEn ? "Article" : "Chi tiết tin" },
  ];

  const encodedUrl = encodeURIComponent(shareUrl);
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodedUrl}`;

  return (
    <>
      <CetPageHeader title={title} crumbs={crumbs} locale={locale} hideTitle />
      <div
        className={`${base.container} ${styles.layout} ${related.length > 0 ? "" : styles.layoutSingle}`}
      >
        <article className={styles.articleMain}>
          {categoryName && <span className={styles.categoryPill}>{categoryName}</span>}
          <h1 className={styles.articleTitle}>{title}</h1>

          <ul className={styles.metaRow}>
            <li>
              <CalendarDays size={16} aria-hidden="true" />
              <time dateTime={article.published_at}>{formatDate(article.published_at, locale)}</time>
            </li>
            {author && (
              <li>
                <User size={16} aria-hidden="true" />
                <span>{author}</span>
              </li>
            )}
            {views > 0 && (
              <li>
                <Eye size={16} aria-hidden="true" />
                <span>
                  {views.toLocaleString(isEn ? "en-US" : "vi-VN")} {isEn ? "views" : "lượt xem"}
                </span>
              </li>
            )}
          </ul>

          {article.cover_url && (
            <div className={styles.cover}>
              <Image
                src={article.cover_url}
                alt={title}
                fill
                priority
                sizes="(min-width: 992px) 800px, 100vw"
              />
            </div>
          )}

          {excerpt && <p className={styles.articleExcerpt}>{excerpt}</p>}

          <div
            className={`rich-text-content ${styles.articleBody}`}
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />

          {tags.length > 0 && (
            <div className={styles.tagRow}>
              <span className={styles.rowLabel}>Tags:</span>
              <ul className={styles.inlineList}>
                {tags.map((tag) => (
                  <li key={tag.id}>
                    <CetLink
                      className={styles.pill}
                      href={`/tin-tuc?tag=${encodeURIComponent(tag.slug)}`}
                      locale={locale}
                    >
                      {getLocalizedField<string>(tag, "name", locale)}
                    </CetLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.shareRow}>
            <span className={styles.rowLabel}>{isEn ? "Share:" : "Chia sẻ:"}</span>
            <ul className={styles.inlineList}>
              <li>
                <a
                  className={styles.shareLink}
                  href={facebookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    isEn
                      ? "Share on Facebook (opens in a new tab)"
                      : "Chia sẻ lên Facebook (mở tab mới)"
                  }
                >
                  <Share2 size={16} aria-hidden="true" />
                  Facebook
                </a>
              </li>
              <li>
                <a className={styles.shareLink} href={mailHref}>
                  <Mail size={16} aria-hidden="true" />
                  Email
                </a>
              </li>
            </ul>
          </div>
        </article>

        {related.length > 0 && (
          <aside aria-label={isEn ? "Sidebar" : "Thanh bên"}>
            <CetSideCard title={isEn ? "Related news" : "Tin liên quan"}>
              <ul className={styles.sideList}>
                {related.map((item) => (
                  <li key={item.id}>
                    <CetLink href={`/tin-tuc/${item.slug}`} locale={locale}>
                      {sentenceCaseTitle(getLocalizedField<string>(item, "title", locale), locale)}
                    </CetLink>
                  </li>
                ))}
              </ul>
            </CetSideCard>
          </aside>
        )}
      </div>
    </>
  );
}
