"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTransition } from "react";

interface ArticlePaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function ArticlePagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
}: ArticlePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("pagination");

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());

    const query = params.toString();
    startTransition(() => {
      router.push(
        (query ? `${pathname}?${query}` : pathname) as Parameters<typeof router.push>[0],
        { scroll: false }
      );
    });

    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      end = Math.min(totalPages, maxVisible);
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1.5 border-t border-slate-100 pt-6"
    >
      {/* Nút Về Đầu (First) */}
      <button
        type="button"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="hover:text-brand-darkred hover:border-brand-darkred inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-sm border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
        title={t("first")}
        aria-label={t("first")}
      >
        <ChevronsLeft size={15} aria-hidden="true" />
      </button>

      {/* Nút Trước (Previous) */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className="hover:text-brand-darkred hover:border-brand-darkred inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-sm border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
        title={t("prev")}
        aria-label={t("prev")}
      >
        <ChevronLeft size={15} aria-hidden="true" />
      </button>

      {/* Nút Số Trang */}
      {visiblePages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            type="button"
            key={p}
            onClick={() => handlePageChange(p)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`${p}`}
            className={`inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-sm border px-3 py-1.5 text-xs font-bold transition ${
              isActive
                ? "bg-brand-darkred border-brand-darkred text-white"
                : "hover:text-brand-darkred hover:border-brand-darkred border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* Nút Tiếp (Next) */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNext}
        className="hover:text-brand-darkred hover:border-brand-darkred inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-sm border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
        title={t("next")}
        aria-label={t("next")}
      >
        <ChevronRight size={15} aria-hidden="true" />
      </button>

      {/* Nút Cuối (Last) */}
      <button
        type="button"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="hover:text-brand-darkred hover:border-brand-darkred inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-sm border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
        title={t("last")}
        aria-label={t("last")}
      >
        <ChevronsRight size={15} aria-hidden="true" />
      </button>
    </nav>
  );
}
