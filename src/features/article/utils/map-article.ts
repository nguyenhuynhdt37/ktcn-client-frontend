import { PortalArticleResponse, PortalArticleListResponse } from "../types/article.types";

// Lấy trường dịch động từ Backend dựa trên locale hiện tại
export function getLocalizedField<T>(item: unknown, field: string, locale: string): T {
  if (!item || typeof item !== "object") return "" as unknown as T;
  const record = item as Record<string, unknown>;

  // 1. Hỗ trợ đối tượng translations đa ngôn ngữ từ Backend (ví dụ: Menu)
  if (record.translations && typeof record.translations === "object") {
    const translations = record.translations as Record<string, Record<string, unknown> | undefined>;
    const translation = translations[locale];
    if (translation && translation[field] !== undefined && translation[field] !== null && translation[field] !== "") {
      return translation[field] as T;
    }
  }

  // 2. Fallback sang format field_locale (ví dụ: title_en) hoặc trường gốc phẳng
  const localizedKey = `${field}_${locale}`;
  return (record[localizedKey] || record[field] || "") as T;
}

// Định dạng ngày theo locale của Next.js (vi-VN hoặc en-US)
export function formatDate(dateString: string, locale: string = "vi"): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const localeTag = locale === "en" ? "en-US" : "vi-VN";
  // Cố định múi giờ Việt Nam: server chạy UTC sẽ hiển thị lệch ngày với bài đăng buổi sáng giờ VN.
  return date.toLocaleDateString(localeTag, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

// Map sang cấu trúc hiển thị của FE với hỗ trợ i18n
export function mapPortalArticleToFE(item: PortalArticleResponse | PortalArticleListResponse, locale: string = "vi") {
  const title = getLocalizedField<string>(item, "title", locale);
  const categoryName = getLocalizedField<string>(item.category, "name", locale);

  return {
    id: item.id,
    title: title,
    imageUrl: item.thumbnail_object_key || "/images/no-image-dhv.jpg",
    category: categoryName,
    categoryHref: `/tin-tuc?category_slug=${item.category.slug}`,
    date: formatDate(item.published_at, locale),
    href: `/tin-tuc/${item.slug}`,
    isPinned: item.is_pinned
  };
}
