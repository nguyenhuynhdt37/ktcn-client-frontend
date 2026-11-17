import { articleService } from "@/features/article/services/articleService";
import type { PortalArticleListResponse } from "@/features/article/types/article.types";
import { categoryService } from "@/features/category/services/categoryService";
import { buildCategoryPills, CET_HIDDEN_CATEGORY_SLUGS, type CategoryPill } from "../utils/inner";

export type CetNewsFilters = { q: string; category: string; tag: string; page: number };

export type CetNewsData = {
  articles: PortalArticleListResponse[];
  page: number;
  totalPages: number;
  totalItems: number;
  pills: CategoryPill[];
  popular: PortalArticleListResponse[];
  filters: CetNewsFilters;
  unavailable: boolean;
};

export async function getCetNewsData(filters: CetNewsFilters): Promise<CetNewsData> {
  const page = Number.isFinite(filters.page) && filters.page >= 1 ? Math.floor(filters.page) : 1;
  const normalized: CetNewsFilters = { ...filters, page };

  const [articles, tree, popular] = await Promise.all([
    articleService.getLatestArticles({
      page,
      pageSize: 10,
      search: normalized.q,
      categorySlug: normalized.category,
      excludeCategorySlugs: normalized.category ? undefined : CET_HIDDEN_CATEGORY_SLUGS,
      tagSlug: normalized.tag,
      sortBy: "publish_at",
      sortDir: "desc",
    }),
    categoryService.getCategoryTree(),
    articleService.getLatestArticles({
      page: 1,
      pageSize: 5,
      excludeCategorySlugs: CET_HIDDEN_CATEGORY_SLUGS,
      sortBy: "view_count",
      sortDir: "desc",
    }),
  ]);

  return {
    articles: articles?.items ?? [],
    page: articles?.page ?? page,
    totalPages: articles?.total_pages ?? 1,
    totalItems: articles?.total_items ?? 0,
    pills: buildCategoryPills(tree ?? [], normalized.category),
    popular: popular?.items ?? [],
    filters: normalized,
    unavailable: articles === null,
  };
}
