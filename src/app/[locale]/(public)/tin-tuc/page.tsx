import { Metadata } from "next";
import { articleService, ArticlePortalContainer } from "@/features/article";
import { categoryService } from "@/features/category";
import { setRequestLocale } from "next-intl/server";
import { constructMetadata } from "@/shared/lib/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    category_slug?: string;
    tag?: string;
    tag_slug?: string;
    sort_by?: string;
    sort_dir?: string;
  }>;
}

// ──────────────────────────────────────────────
// 1. TỐI ƯU SEO ĐỘNG (Dynamic Metadata)
// ──────────────────────────────────────────────
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q, category, category_slug, tag, tag_slug, page } = await searchParams;
  
  const activeCategory = category_slug || category || "";
  const activeTag = tag_slug || tag || "";
  const isEn = locale === "en";
  const pageStr = page ? (isEn ? ` - Page ${page}` : ` - Trang ${page}`) : "";
  
  let title = isEn ? "Latest News & Events" : "Tin tức & Sự kiện nổi bật";
  const description = isEn
    ? "Updating the latest news and events from the College of Engineering and Technology - Vinh University."
    : "Cập nhật tin tức, sự kiện mới nhất từ Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh.";

  if (q) {
    title = isEn ? `Search results for "${q}"${pageStr}` : `Kết quả tìm kiếm cho "${q}"${pageStr}`;
  } else if (activeCategory) {
    const formattedCategory = activeCategory.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    title = isEn ? `Category: ${formattedCategory}${pageStr}` : `Chuyên mục: ${formattedCategory}${pageStr}`;
  } else if (activeTag) {
    const tagCount = activeTag.split(",").length;
    title = isEn ? `Filtered by ${tagCount} tags${pageStr}` : `Lọc theo ${tagCount} thẻ tag${pageStr}`;
  }

  // Xây dựng canonical URL chuẩn hóa i18n
  const queryParams = new URLSearchParams();
  if (activeCategory) queryParams.append("category_slug", activeCategory);
  if (activeTag) queryParams.append("tag_slug", activeTag);
  if (page) queryParams.append("page", page);
  
  const queryStr = queryParams.toString() ? "?" + queryParams.toString() : "";
  
  return constructMetadata({
    title: `${title} | ${isEn ? "College of Engineering and Technology" : "Trường Kỹ thuật và Công nghệ"}`,
    description,
    locale,
    slug: isEn ? `search${queryStr}` : `tim-kiem${queryStr}`,
    alternatesLanguages: {
      vi: `tim-kiem${queryStr}`,
      en: `search${queryStr}`,
    },
    robots: q ? ["noindex", "follow"] as any : undefined,
  });
}

import { Suspense } from "react";

// ──────────────────────────────────────────────
// 2. MAIN COMPONENT (Server Component)
// ──────────────────────────────────────────────
export default async function NewsAggregatePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  
  // Cấu hình static rendering locale
  setRequestLocale(locale);

  const { page, q, category, category_slug, tag, tag_slug, sort_by, sort_dir } = await searchParams;
  
  const currentPage = parseInt(page || "1");
  const searchQuery = q || "";
  const categorySlug = category_slug || category || "";
  const tagSlug = tag_slug || tag || "";
  const sortBy = sort_by || "publish_at";
  const sortDir = sort_dir || "desc";

  // Gọi API đồng thời phía Server-side để tối ưu Core Web Vitals
  const [articlesData, categoriesData, tagsData] = await Promise.all([
    articleService.getLatestArticles({
      page: currentPage,
      pageSize: 10,
      search: searchQuery,
      categorySlug: categorySlug,
      excludeCategorySlugs: categorySlug ? undefined : ["lich-tuan", "weekly-calendar", "gioi-thieu", "lich-su-phat-trien", "chuc-nang-nhiem-vu"],
      tagSlug: tagSlug,
      sortBy: sortBy as any,
      sortDir: sortDir as any,
    }),
    categoryService.getCategoryTree(),
    articleService.getPopularTags(),
  ]);

  const articles = articlesData?.items || [];
  const categories = categoriesData || [];
  const tags = tagsData?.items || [];

  return (
    <>
      <Suspense fallback={
      <div className="max-w-[1360px] mx-auto px-6 py-24 text-center text-slate-600 font-semibold">
        {locale === "en" ? "Loading articles..." : "Đang tải bài viết..."}
      </div>
    }>
      <ArticlePortalContainer
        articles={articles}
        pagination={
          articlesData || {
            items: [],
            page: 1,
            page_size: 10,
            total_items: 0,
            total_pages: 1,
            has_next: false,
            has_previous: false,
          }
        }
        categories={categories}
        tags={tags}
        filters={{
          page: currentPage,
          q: searchQuery,
          category: categorySlug,
          tag: tagSlug,
          sort_by: sortBy,
          sort_dir: sortDir,
        }}
        locale={locale}
      />
    </Suspense>
    </>
  );
}
