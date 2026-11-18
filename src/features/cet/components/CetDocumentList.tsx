import { Download, FileText, Search } from "lucide-react";
import { resolveSettingMediaUrl } from "@/features/setting/services/settingService";
import { formatDate } from "@/features/article/utils/map-article";
import {
  formatFileSize,
  type CetDocumentData,
  type DocumentKindSlug,
} from "../services/document-data";
import { pageNumbers } from "../utils/inner";
import { CetLink, localizedPortalHref } from "./CetLink";
import { CetPageHeader } from "./CetPageHeader";
import base from "../cet.module.css";
import styles from "../cet-inner.module.css";

function listHref(slug: DocumentKindSlug, search: string, page: number): string {
  const query = new URLSearchParams();
  if (search) query.set("q", search);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return `/tai-lieu/${slug}${qs ? `?${qs}` : ""}`;
}

export function CetDocumentList({
  data,
  slug,
  locale,
}: {
  data: CetDocumentData;
  slug: DocumentKindSlug;
  locale: string;
}) {
  const isEn = locale === "en";
  const { items, page, totalPages, search } = data;
  const tabs: Array<{ slug: DocumentKindSlug; label: string }> = [
    { slug: "van-ban-bieu-mau", label: isEn ? "Documents & forms" : "Văn bản – Biểu mẫu" },
    { slug: "bai-giang-giao-trinh", label: isEn ? "Lectures & textbooks" : "Bài giảng – Giáo trình" },
  ];
  const title = tabs.find((tab) => tab.slug === slug)?.label ?? "";

  return (
    <>
      <CetPageHeader title={title} crumbs={[{ label: title }]} locale={locale} />
      <div className={`${base.container} ${styles.docPage}`}>
        <nav aria-label={isEn ? "Document groups" : "Nhóm tài liệu"}>
          <ul className={styles.pillRow}>
            {tabs.map((tab) => (
              <li key={tab.slug}>
                <CetLink
                  className={`${styles.pill} ${tab.slug === slug ? styles.pillActive : ""}`}
                  href={`/tai-lieu/${tab.slug}`}
                  locale={locale}
                  aria-current={tab.slug === slug ? "page" : undefined}
                >
                  {tab.label}
                </CetLink>
              </li>
            ))}
          </ul>
        </nav>

        <form className={styles.docSearch} action={localizedPortalHref(`/tai-lieu/${slug}`, locale)} method="get" role="search">
          <input
            type="search"
            name="q"
            defaultValue={search}
            maxLength={100}
            placeholder={isEn ? "Search documents..." : "Tìm tài liệu..."}
            aria-label={isEn ? "Search documents" : "Tìm tài liệu"}
          />
          <button type="submit" aria-label={isEn ? "Search" : "Tìm kiếm"}>
            <Search size={18} aria-hidden="true" />
          </button>
        </form>

        {items.length > 0 ? (
          <ul className={styles.docList}>
            {items.map((doc) => {
              const href = resolveSettingMediaUrl(doc.file_url);
              const docTitle = (isEn && doc.title_en) || doc.title_vi;
              const size = formatFileSize(doc.file_size);
              const ext = doc.file_name.includes(".")
                ? doc.file_name.split(".").pop()?.toUpperCase()
                : "";
              return (
                <li key={doc.id} className={styles.docItem}>
                  <span className={styles.docIcon} aria-hidden="true">
                    <FileText size={22} />
                  </span>
                  <div className={styles.docBody}>
                    <h3>{docTitle}</h3>
                    {doc.description && <p>{doc.description}</p>}
                    <span className={styles.docMeta}>
                      {[ext, size, formatDate(doc.created_at, locale)].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  {href && (
                    <a
                      className={styles.docDownload}
                      href={href}
                      download={doc.file_name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={16} aria-hidden="true" />
                      {isEn ? "Download" : "Tải về"}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={styles.emptyState} role={data.unavailable ? "status" : undefined}>
            <p>
              {data.unavailable
                ? isEn
                  ? "Documents are temporarily unavailable. Please try again later."
                  : "Danh sách tài liệu tạm thời chưa tải được. Vui lòng thử lại sau."
                : isEn
                  ? "No documents have been published yet."
                  : "Chưa có tài liệu nào được đăng tải."}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label={isEn ? "Pagination" : "Phân trang"}>
            <ul className={styles.paginationList}>
              {pageNumbers(page, totalPages).map((entry, index) => (
                <li key={`${index}-${entry}`}>
                  {entry === "…" ? (
                    <span className={styles.pageEllipsis} aria-hidden="true">
                      …
                    </span>
                  ) : entry === page ? (
                    <span className={`${styles.pageLink} ${styles.pageCurrent}`} aria-current="page">
                      {entry}
                    </span>
                  ) : (
                    <CetLink className={styles.pageLink} href={listHref(slug, search, entry)} locale={locale}>
                      {entry}
                    </CetLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
