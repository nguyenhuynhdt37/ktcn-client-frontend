import { articleService } from "@/features/article/services/articleService";
import type { PortalArticleListResponse } from "@/features/article/types/article.types";

/** Up to 4 other articles of the same category, for the "Tin liên quan" sidebar card. */
export async function getCetRelatedArticles(
  categorySlug: string,
  excludeId: string,
): Promise<PortalArticleListResponse[]> {
  if (!categorySlug) return [];
  const data = await articleService.getArticlesByCategory(categorySlug, 1, 5);
  return (data?.items ?? [])
    .filter((item) => item.id !== excludeId)
    .slice(0, 4);
}
