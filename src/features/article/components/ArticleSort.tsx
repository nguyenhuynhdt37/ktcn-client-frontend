"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { useTransition } from "react";

interface ArticleSortProps {
  currentSortBy: string;
  currentSortDir: string;
}

export function ArticleSort({ currentSortBy, currentSortDir }: ArticleSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [, startTransition] = useTransition();
  const t = useTranslations("sort");

  // Mặc định
  const sortBy = currentSortBy || "publish_at";
  const sortDir = currentSortDir || "desc";

  const updateSort = (newSortBy: string, newSortDir: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Cập nhật params
    if (newSortBy === "publish_at") {
      params.delete("sort_by");
    } else {
      params.set("sort_by", newSortBy);
    }

    if (newSortDir === "desc") {
      params.delete("sort_dir");
    } else {
      params.set("sort_dir", newSortDir);
    }

    // Giữ nguyên filter, chỉ reset page về 1
    params.set("page", "1");
    const query = params.toString();

    startTransition(() => {
      router.push(
        (query ? `${pathname}?${query}` : pathname) as Parameters<typeof router.push>[0],
        { scroll: false }
      );
    });
  };

  const handleSortByChange = (value: string) => {
    updateSort(value, sortDir);
  };

  const toggleSortDir = () => {
    const nextDir = sortDir === "desc" ? "asc" : "desc";
    updateSort(sortBy, nextDir);
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-none">
      <span className="hidden text-sm font-medium whitespace-nowrap text-slate-600 sm:inline">
        {t("label")}:
      </span>
      <div className="border-border flex min-w-0 flex-1 items-center rounded-lg border bg-white md:flex-none">
        <select
          value={sortBy}
          onChange={(e) => handleSortByChange(e.target.value)}
          aria-label={t("label")}
          className="h-11 min-w-0 flex-1 cursor-pointer border-none bg-transparent pr-7 pl-3 text-sm text-slate-700 focus:outline-none md:w-44"
        >
          <option value="publish_at">{t("newest")}</option>
          <option value="view_count">{t("most_viewed")}</option>
          <option value="title">{locale === "en" ? "Title (A-Z)" : "Tiêu đề (A-Z)"}</option>
          <option value="created_at">{locale === "en" ? "Date created" : "Ngày tạo"}</option>
        </select>

        {/* Nút toggle Ascending / Descending */}
        <button
          onClick={toggleSortDir}
          type="button"
          title={
            sortDir === "desc"
              ? locale === "en"
                ? "Descending"
                : "Giảm dần"
              : locale === "en"
                ? "Ascending"
                : "Tăng dần"
          }
          className="border-border hover:bg-surface hover:text-brand-darkred inline-flex size-11 shrink-0 items-center justify-center border-l text-slate-600 transition-colors duration-150"
          aria-label={
            sortDir === "desc"
              ? locale === "en"
                ? "Descending"
                : "Giảm dần"
              : locale === "en"
                ? "Ascending"
                : "Tăng dần"
          }
        >
          {sortDir === "desc" ? (
            <ArrowDownAZ size={17} aria-hidden="true" />
          ) : (
            <ArrowUpAZ size={17} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
