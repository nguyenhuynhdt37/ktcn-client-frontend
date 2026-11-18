"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, type RouterHref } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CategoryTreeNode } from "../types/category.types";
import { resolveCategoryName, resolveCategorySlug, isCategorySlugMatch } from "../utils/resolve";

interface CategorySidebarTreeProps {
  tree: CategoryTreeNode[];
}

export function CategorySidebarTree({ tree }: CategorySidebarTreeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const activeCategorySlug =
    searchParams.get("category_slug") || searchParams.get("category") || "";
  const tArticle = useTranslations("article");

  // Trạng thái Transition giúp điều hướng mượt mà, không bị kích hoạt Suspense skeleton nhấp nháy trang
  const [isPending, startTransition] = useTransition();

  // Quản lý trạng thái mở rộng của danh mục cha theo ID danh mục
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Tự động xác định các danh mục cha cần mở rộng nếu có danh mục con đang được chọn
  const activePathSet = useMemo(() => {
    if (!activeCategorySlug) return new Set<string>();

    const findActivePath = (
      nodes: CategoryTreeNode[],
      targetSlug: string,
      path: string[] = [],
    ): string[] | null => {
      for (const node of nodes) {
        if (isCategorySlugMatch(node, targetSlug)) {
          return path;
        }
        if (node.children && node.children.length > 0) {
          const found = findActivePath(node.children, targetSlug, [...path, node.id]);
          if (found) return found;
        }
      }
      return null;
    };

    return new Set(findActivePath(tree, activeCategorySlug) ?? []);
  }, [activeCategorySlug, tree]);

  // Hàm sinh URL giữ nguyên các query params khác của trang
  const getCategoryUrl = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category_slug", slug);
      params.delete("category");
      params.delete("tag"); // Reset lọc tag khi chọn category
      params.delete("tag_slug");
    } else {
      params.delete("category");
      params.delete("category_slug");
    }
    params.set("page", "1"); // Quay về trang 1
    return `/tin-tuc?${params.toString()}`;
  };

  const handleNavigate = (slug: string | null) => {
    const url = getCategoryUrl(slug);
    startTransition(() => {
      // scroll: false ngăn Next.js tự động cuộn trang lên đầu
      router.push(url as RouterHref, { scroll: false });
    });
  };

  const handleToggleExpand = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => {
      const current = prev[id] ?? activePathSet.has(id);
      return {
        ...prev,
        [id]: !current,
      };
    });
  };

  // Render một Node danh mục và các node con của nó đệ quy
  const renderNode = (node: CategoryTreeNode, depth: number = 0) => {
    const isSelected = isCategorySlugMatch(node, activeCategorySlug);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id] ?? activePathSet.has(node.id);
    const categoryName = resolveCategoryName(node, locale);
    const localizedSlug = resolveCategorySlug(node, locale);

    // Node cha (depth === 0)
    if (depth === 0) {
      return (
        <div key={node.id} className="border-b border-slate-200/50 last:border-b-0">
          {/* Dòng danh mục cha */}
          <div className="group flex items-center justify-between">
            <button
              onClick={() => {
                handleNavigate(localizedSlug);
                if (hasChildren) {
                  setExpanded((prev) => ({ ...prev, [node.id]: true }));
                }
              }}
              type="button"
              className={`flex flex-1 cursor-pointer items-center justify-between px-4 py-3 text-left text-sm font-semibold transition duration-150 ${
                isSelected
                  ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold"
                  : "hover:text-brand-darkred text-slate-800"
              }`}
            >
              <span className="truncate">{categoryName}</span>

              {/* Badge số lượng khi không có danh mục con */}
              {!hasChildren && (
                <span className="ml-2 shrink-0 rounded-full bg-slate-200/60 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {node.article_count}
                </span>
              )}
            </button>

            {/* Mũi tên đóng mở bên phải và badge số lượng khi có danh mục con */}
            {hasChildren && (
              <div className="flex shrink-0 items-center gap-1 pr-1">
                <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {node.article_count}
                </span>
                <button
                  onClick={(e) => handleToggleExpand(e, node.id)}
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? (locale === "en" ? "Collapse" : "Thu gọn") : locale === "en" ? "Expand" : "Mở rộng"} ${categoryName}`}
                  className="cursor-pointer p-3 text-slate-600 transition hover:text-slate-900"
                >
                  {isExpanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                </button>
              </div>
            )}
          </div>

          {/* Các danh mục con hiển thị thụt lề nếu danh mục cha mở */}
          {hasChildren && isExpanded && (
            <div className="space-y-0.5 bg-slate-100/30 pb-2">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Node con (depth > 0)
    return (
      <div key={node.id} className="space-y-0.5">
        <button
          onClick={() => handleNavigate(localizedSlug)}
          type="button"
          className={`flex w-full cursor-pointer items-center justify-between px-6 py-2 text-xs font-semibold transition duration-150 hover:bg-slate-200/50 ${
            isSelected ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold" : "hover:text-brand-darkred text-slate-700"
          }`}
          style={{ paddingLeft: `${depth * 14 + 14}px` }}
        >
          <div className="flex items-center gap-2 truncate">
            {/* Ký tự hình thoi nhỏ đầu dòng ◆ */}
            <span className="shrink-0 text-sm text-slate-400" aria-hidden="true">
              ›
            </span>
            <span className="truncate">{categoryName}</span>
          </div>

          {/* Số lượng bài viết bên cạnh */}
          <span className="shrink-0 rounded-full bg-slate-200/60 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {node.article_count}
          </span>
        </button>

        {/* Đệ quy tiếp tục nếu có con sâu hơn */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`border-border bg-surface overflow-hidden rounded-xl border transition-opacity ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      {/* Header Banner đỏ đậm */}
      <div className="bg-brand-darkred px-4 py-3 text-center">
        <h3 className="text-sm font-bold tracking-wider text-white uppercase">
          {tArticle("filter_by_categories")}
        </h3>
      </div>

      {/* Lựa chọn xem tất cả bài viết */}
      <div className="border-b border-slate-200/50">
        <button
          onClick={() => handleNavigate(null)}
          type="button"
          className={`w-full cursor-pointer px-4 py-3 text-left text-sm font-semibold transition duration-150 ${
            !activeCategorySlug
              ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold"
              : "hover:text-brand-darkred text-slate-800"
          }`}
        >
          {tArticle("all_articles")}
        </button>
      </div>

      {/* Danh sách cây danh mục */}
      <div className="divide-y divide-slate-200/50">{tree.map((node) => renderNode(node))}</div>
    </div>
  );
}
