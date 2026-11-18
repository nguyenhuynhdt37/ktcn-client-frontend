import { PortalCategoryResponse, CategoryTreeNode } from "../types/category.types";

interface CategoryTranslation {
  is_translated?: boolean;
  name?: string;
  slug?: string;
}

type CategoryLike = (PortalCategoryResponse | CategoryTreeNode) & {
  translations?: Record<string, CategoryTranslation | undefined>;
};

/**
 * Hàm helper để phân giải tên danh mục theo ngôn ngữ hiện tại của FE Client.
 * Sử dụng bản dịch tương ứng nếu có, fallback về Tiếng Việt, hoặc trường phẳng ngoài root.
 */
export const resolveCategoryName = (category: CategoryLike | null | undefined, currentLang: string): string => {
  if (!category) return "";
  
  const translations = category.translations;
  const translation = translations?.[currentLang];
  
  // Nếu có bản dịch cho ngôn ngữ hiện tại và bản dịch đó hợp lệ
  if (translation && translation.is_translated && translation.name) {
    return translation.name;
  }
  
  // Fallback về bản dịch tiếng Việt mặc định
  const viTranslation = translations?.["vi"];
  if (viTranslation && viTranslation.name) {
    return viTranslation.name;
  }
  
  // Fallback cuối cùng về trường phẳng ngoài root
  return category.name || "";
};

/**
 * Hàm helper phân giải slug danh mục theo ngôn ngữ để làm link định tuyến.
 * Sử dụng bản dịch tương ứng nếu có, fallback về Tiếng Việt, hoặc trường phẳng ngoài root.
 */
export const resolveCategorySlug = (category: CategoryLike | null | undefined, currentLang: string): string => {
  if (!category) return "";

  const translations = category.translations;
  const translation = translations?.[currentLang];
  
  if (translation && translation.is_translated && translation.slug) {
    return translation.slug;
  }
  
  const viTranslation = translations?.["vi"];
  if (viTranslation && viTranslation.slug) {
    return viTranslation.slug;
  }
  
  return category.slug || "";
};

/**
 * Hàm helper kiểm tra xem một category có khớp với một slug mục tiêu hay không.
 * So sánh với slug gốc và slug của tất cả các bản dịch.
 */
export const isCategorySlugMatch = (category: CategoryLike | null | undefined, targetSlug: string): boolean => {
  if (!category || !targetSlug) return false;
  if (category.slug === targetSlug) return true;
  
  const translations = category.translations;
  if (translations) {
    for (const lang in translations) {
      if (translations[lang]?.slug === targetSlug) {
        return true;
      }
    }
  }
  return false;
};
