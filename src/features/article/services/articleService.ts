import {
  PortalArticleListPaginationResponse,
  PortalArticlePaginationResponse,
  PortalTagPaginationResponse,
  GetLatestArticlesParams,
  PortalArticleDetail
} from "../types/article.types";
import { httpClient } from "@/shared/api/httpClient";

export const articleService = {
  /**
   * Lấy danh sách bài viết mới nhất/phân trang/tìm kiếm
   */
  async getLatestArticles(
    params: GetLatestArticlesParams = {}
  ): Promise<PortalArticleListPaginationResponse | null> {
    return httpClient.get<PortalArticleListPaginationResponse>("/api/v1/portal/articles", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        category_slug: params.categorySlug,
        tag_slug: params.tagSlug,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        author_username: params.authorUsername,
        is_pinned: params.isPinned,
        has_thumbnail: params.hasThumbnail,
        category_slugs: Array.isArray(params.categorySlugs) ? params.categorySlugs.join(",") : params.categorySlugs,
        exclude_category_slugs: Array.isArray(params.excludeCategorySlugs) ? params.excludeCategorySlugs.join(",") : params.excludeCategorySlugs,
      },
      revalidate: 300, // Cache 5 phút
    });
  },

  /**
   * Lấy chi tiết bài viết theo slug
   */
  async getArticleDetail(slug: string): Promise<PortalArticleDetail | null> {
    return httpClient.get<PortalArticleDetail>(`/api/v1/portal/articles/${encodeURIComponent(slug)}`, {
      revalidate: 600, // Cache 10 phút
      forwardCookies: true,
    });
  },

  /**
   * Lấy danh sách bài viết theo chuyên mục (Category slug)
   */
  async getArticlesByCategory(
    categorySlug: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PortalArticlePaginationResponse | null> {
    return httpClient.get<PortalArticlePaginationResponse>(`/api/v1/portal/categories/${encodeURIComponent(categorySlug)}/articles`, {
      params: {
        page,
        page_size: pageSize,
      },
      revalidate: 600, // Cache 10 phút
    });
  },

  /**
   * Lấy danh sách thẻ tags phổ biến
   */
  async getPopularTags(): Promise<PortalTagPaginationResponse | null> {
    return httpClient.get<PortalTagPaginationResponse>("/api/v1/portal/tags", {
      params: {
        page: 1,
        page_size: 20,
        only_has_articles: false,
      },
      revalidate: 600, // Cache 10 phút
    });
  },
};
