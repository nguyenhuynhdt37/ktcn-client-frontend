import { MenuItemTreeNode } from "../types/menu.types";
import { safePortalHref } from "@/shared/lib/security";

export function resolveMenuUrl(item: MenuItemTreeNode, locale?: string): string {
  // 1. Kiểm tra tính hợp lệ của link cấu hình
  if (!item.has_link || !item.target_type) {
    return "#";
  }

  // 2. Nếu là đường dẫn ngoài (External Link)
  if (item.target_type === "EXTERNAL_LINK") {
    let url = safePortalHref(item.external_url, "#");
    if (locale && url !== "#") {
      if (locale === "vi") {
        url = url.replace(/\/en(\/|$)/g, "/vi$1");
      } else if (locale === "en") {
        url = url.replace(/\/vi(\/|$)/g, "/en$1");
      }
    }
    return url;
  }

  // 3. Phân giải theo từng loại TargetType của Portal
  const slug = item.target_info?.slug;
  if (!slug) return "#";

  switch (item.target_type) {
    case "CATEGORY":
      // Danh mục tin tức: Trỏ về trang tin tức có filter theo category_slug
      return `/tin-tuc?category_slug=${slug}`;
      
    case "ARTICLE":
    case "PAGE":
      // Bài viết chi tiết và Trang tĩnh: Đều trỏ về /[locale]/[slug] (được next-intl định cấu hình /tin-tuc/[slug])
      return `/tin-tuc/${slug}`;
      
    case "DEPARTMENT":
      // Bộ môn: Trỏ về trang chi tiết bộ môn /bo-mon/[slug]
      return `/bo-mon/${slug}`;
      
    case "MODULE":
      // Phân hệ/Module chức năng đặc thù (ví dụ: Lịch tuần)
      if (slug === "lich-tuan") {
        return "/lich-tuan";
      }
      return `/${slug}`;
      
    default:
      return "#";
  }
}
