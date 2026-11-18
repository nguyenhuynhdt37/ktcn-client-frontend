"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Filter, X, RotateCcw } from "lucide-react";
import { CategoryTreeNode } from "@/features/category";
import { PortalTagResponse } from "../types/article.types";
import { ArticleSearch } from "./ArticleSearch";
import { ArticleSort } from "./ArticleSort";
import { getLocalizedField } from "../utils/map-article";

import { useTransition } from "react";

interface ArticleToolbarProps {
  categories: CategoryTreeNode[];
  tags: PortalTagResponse[];
  currentFilters: {
    category: string;
    tag: string; // Có thể chứa nhiều tag slug cách nhau bởi dấu phẩy
  };
  searchQuery: string;
  sortBy: string;
  sortDir: string;
  onOpenFilter: () => void;
}

// Hàm đệ quy tìm kiếm tên category theo slug trong cây hỗ trợ i18n
function findCategoryNameBySlug(
  nodes: CategoryTreeNode[],
  slug: string,
  locale: string,
): string | null {
  for (const node of nodes) {
    if (node.slug === slug) {
      return getLocalizedField<string>(node, "name", locale);
    }
    if (node.children && node.children.length > 0) {
      const found = findCategoryNameBySlug(node.children, slug, locale);
      if (found) return found;
    }
  }
  return null;
}

export function ArticleToolbar({
  categories,
  tags,
  currentFilters,
  searchQuery,
  sortBy,
  sortDir,
  onOpenFilter,
}: ArticleToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [, startTransition] = useTransition();
  const tCommon = useTranslations("common");
  const tArticle = useTranslations("article");

  const removeFilterParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key.startsWith("tag-")) {
      // Loại bỏ một tag cụ thể ra khỏi chuỗi tag cách nhau bởi dấu phẩy
      const tagToRemove = key.replace("tag-", "");
      const currentTags = params.get("tag_slug") || params.get("tag") || "";
      const updatedTags = currentTags.split(",").filter((t) => t !== tagToRemove);

      if (updatedTags.length > 0) {
        params.set("tag_slug", updatedTags.join(","));
        params.delete("tag");
      } else {
        params.delete("tag_slug");
        params.delete("tag");
      }
    } else {
      if (key === "category") {
        params.delete("category");
        params.delete("category_slug");
      } else {
        params.delete(key);
      }
    }

    params.set("page", "1"); // Reset page về 1
    const query = params.toString();
    startTransition(() => {
      router.push(
        (query ? `${pathname}?${query}` : pathname) as Parameters<typeof router.push>[0],
        { scroll: false }
      );
    });
  };

  const handleClearAll = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort_by");
    const dir = searchParams.get("sort_dir");
    if (sort) params.set("sort_by", sort);
    if (dir) params.set("sort_dir", dir);
    const query = params.toString();

    startTransition(() => {
      router.push(
        (query ? `${pathname}?${query}` : pathname) as Parameters<typeof router.push>[0],
        { scroll: false }
      );
    });
  };

  // Xác định tên hiển thị của các chips
  const activeChips: Array<{ key: string; label: string }> = [];

  if (searchQuery) {
    activeChips.push({ key: "q", label: `${tCommon("search")}: "${searchQuery}"` });
  }
  if (currentFilters.category) {
    const catName = findCategoryNameBySlug(categories, currentFilters.category, locale);
    activeChips.push({
      key: "category",
      label: `${tArticle("category")}: ${catName || currentFilters.category}`,
    });
  }
  if (currentFilters.tag) {
    // Tách các thẻ tag để hiển thị thành từng chip riêng biệt
    const activeTagSlugs = currentFilters.tag.split(",");
    activeTagSlugs.forEach((slug) => {
      const tg = tags.find((t) => t.slug === slug);
      const tgName = tg ? getLocalizedField<string>(tg, "name", locale) : slug;
      activeChips.push({ key: `tag-${slug}`, label: `${tArticle("tags")}: ${tgName}` });
    });
  }

  const isAnyFilterActive = activeChips.length > 0;

  return (
    <div className="border-border relative z-20 space-y-3 rounded-xl border bg-white p-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {/* Search Input */}
        <ArticleSearch initialSearch={searchQuery} />

        {/* Sort & Filter buttons */}
        <div className="flex w-full shrink-0 items-center justify-between gap-3 md:w-auto md:justify-end">
          <ArticleSort currentSortBy={sortBy} currentSortDir={sortDir} />

          {/* Nút Lọc trên Mobile */}
          <button
            onClick={onOpenFilter}
            type="button"
            className="border-border hover:border-brand-darkred hover:text-brand-darkred flex min-h-11 items-center gap-1.5 rounded-lg border bg-white px-3 text-sm font-semibold text-slate-700 transition-colors duration-150 lg:hidden"
          >
            <Filter size={16} aria-hidden="true" />
            <span>
              {locale === "en" ? "Filter" : "Lọc"} (
              {activeChips.filter((c) => !c.key.startsWith("q")).length})
            </span>
          </button>
        </div>
      </div>

      {/* Danh sách các filter chips đang active */}
      {isAnyFilterActive && (
        <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-3 text-sm">
          <span className="font-medium whitespace-nowrap text-slate-600">
            {locale === "en" ? "Active filters:" : "Đang lọc:"}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="border-border bg-surface animate-fade-in flex min-h-11 items-center gap-1 rounded-lg border pr-1 pl-3 font-medium text-slate-700"
              >
                <span>{chip.label}</span>
                <button
                  onClick={() => removeFilterParam(chip.key)}
                  type="button"
                  className="hover:text-brand-darkred inline-flex size-10 items-center justify-center rounded-md text-slate-600 transition-colors duration-150 hover:bg-white"
                  aria-label={`${locale === "en" ? "Remove filter" : "Bỏ bộ lọc"} ${chip.label}`}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </span>
            ))}

            <button
              onClick={handleClearAll}
              type="button"
              className="text-brand-darkred hover:bg-brand-darkred/5 hover:text-brand-darkred-dark ml-1 flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold transition-colors duration-150"
            >
              <RotateCcw size={15} aria-hidden="true" />
              <span>{tCommon("clear_all")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
