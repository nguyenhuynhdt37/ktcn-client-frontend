"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { X, RefreshCw, Tag as TagIcon } from "lucide-react";
import { useEffect, useTransition } from "react";
import { PortalTagResponse } from "../types/article.types";
import { getLocalizedField } from "../utils/map-article";

interface ArticleFilterProps {
  tags: PortalTagResponse[];
  currentTagFilter: string; // Chuỗi các tag slug phân tách bằng dấu phẩy (ví dụ: "cntt,tuyen-sinh")
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleFilter({ tags, isOpen, onClose }: ArticleFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const tArticle = useTranslations("article");

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Mảng các tag slug đang hoạt động
  const currentTag = searchParams.get("tag_slug") || searchParams.get("tag") || "";
  const activeTagSlugs = currentTag ? currentTag.split(",") : [];

  // Danh sách các tag đang active trong database
  const activeTags = tags.filter((t) => t.is_active);

  const handleToggleTag = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let nextSlugs = [...activeTagSlugs];

    if (nextSlugs.includes(slug)) {
      nextSlugs = nextSlugs.filter((s) => s !== slug);
    } else {
      nextSlugs.push(slug);
    }

    if (nextSlugs.length > 0) {
      params.set("tag_slug", nextSlugs.join(","));
      params.delete("tag");
    } else {
      params.delete("tag_slug");
      params.delete("tag");
    }

    params.set("page", "1"); // Tự động reset về trang 1
    const query = params.toString();
    startTransition(() => {
      router.push(
        (query ? `${pathname}?${query}` : pathname) as Parameters<typeof router.push>[0],
        { scroll: false }
      );
    });
  };

  const handleClearTags = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag_slug");
    params.delete("tag");
    params.set("page", "1");
    const query = params.toString();
    startTransition(() => {
      router.push(
        (query ? `${pathname}?${query}` : pathname) as Parameters<typeof router.push>[0],
        { scroll: false }
      );
    });
  };

  const isAnyTagActive = activeTagSlugs.length > 0;

  const filterContent = (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-slate-100/60 shadow-sm transition-opacity ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      {/* Header Banner đỏ đậm */}
      <div className="bg-brand-darkred px-4 py-3 text-center">
        <h3 className="text-sm font-bold tracking-wider text-white uppercase">
          {tArticle("tags")}
        </h3>
      </div>

      {/* Lựa chọn xem tất cả thẻ tag */}
      <div className="border-b border-slate-200/50">
        <button
          onClick={handleClearTags}
          type="button"
          className={`w-full cursor-pointer px-4 py-3 text-left text-sm font-semibold transition duration-150 ${
            !isAnyTagActive
              ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold"
              : "hover:text-brand-darkred text-slate-800"
          }`}
        >
          {tArticle("all_tags")}
        </button>
      </div>

      {/* Danh sách các thẻ tag dưới dạng checkbox */}
      <div className="max-h-[350px] divide-y divide-slate-200/50 overflow-y-auto">
        {activeTags.map((t) => {
          const isSelected = activeTagSlugs.includes(t.slug);
          const tagName = getLocalizedField<string>(t, "name", locale);
          return (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs font-semibold transition select-none hover:bg-slate-200/40 ${
                isSelected
                  ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold"
                  : "hover:text-brand-darkred text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleTag(t.slug)}
                  className="text-brand-darkred focus:ring-brand-darkred accent-brand-darkred h-3.5 w-3.5 cursor-pointer rounded-none border-slate-300"
                />
                {/* Icon Tag nhỏ có màu chỉ định từ backend DB */}
                <TagIcon
                  size={11}
                  className="shrink-0 transition-colors"
                  style={t.color ? { color: t.color } : { color: "#94a3b8" }}
                />
                <span className="truncate">{tagName}</span>
              </div>

              {/* Badge số lượng bài viết của tag */}
              <span className="shrink-0 rounded-full bg-slate-200/60 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {t.article_count ?? t.usage_count ?? 0}
              </span>
            </label>
          );
        })}
      </div>

      {/* Nút đặt lại nhanh */}
      {isAnyTagActive && (
        <div className="flex justify-center border-t border-slate-200/50 bg-white p-3">
          <button
            onClick={handleClearTags}
            type="button"
            className="text-brand-darkred hover:text-brand-darkred-dark flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-semibold hover:underline"
          >
            <RefreshCw size={11} />
            <span>{locale === "en" ? "Clear selection" : "Xóa các thẻ đã chọn"}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Giao diện Desktop sidebar */}
      <div className="hidden h-fit lg:block">{filterContent}</div>

      {/* Giao diện Mobile Drawer/Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tArticle("filter_by_tags")}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          className="animate-fade-in absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Drawer content trượt từ bên phải */}
        <div
          className={`absolute top-0 right-0 z-10 flex h-full w-80 max-w-full flex-col bg-white shadow-xl border-l border-border transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header Drawer */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-800 uppercase">
              {tArticle("filter_by_tags")}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label={locale === "en" ? "Close filter" : "Đóng bộ lọc"}
              className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Body Drawer */}
          <div className="flex-1 overflow-y-auto p-6">{filterContent}</div>

          {/* Footer Drawer */}
          <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={handleClearTags}
              disabled={!isAnyTagActive}
              className="flex-1 cursor-pointer rounded-lg border border-border py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              {locale === "en" ? "Reset" : "Đặt lại"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-brand-darkred hover:bg-brand-darkred-dark flex-1 cursor-pointer rounded-lg py-2.5 text-xs font-bold text-white transition"
            >
              {locale === "en" ? "Close" : "Đóng"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
