"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useRouter, usePathname, type RouterHref } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

interface ArticleSearchProps {
  initialSearch: string;
}

export function ArticleSearch({ initialSearch }: ArticleSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("common");

  const [value, setValue] = useState(initialSearch);
  const isFirstRender = useRef(true);

  // Dùng Ref để lưu trữ searchParams hiện tại, tránh trigger useEffect khi các params khác (page, tag...) thay đổi
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Debounce search value
  useEffect(() => {
    // Bỏ qua lần render đầu tiên để tránh push URL trùng
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Chỉ trigger tìm kiếm khi value thực sự khác với parameter 'q' hiện tại trên URL
    const currentParams = searchParamsRef.current;
    const currentQuery = currentParams.get("q") || "";
    if (value === currentQuery) {
      return;
    }

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.set("page", "1"); // Thay đổi search tự động reset page về 1

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}` as RouterHref, { scroll: false });
      });
    }, 400); // Debounce 400ms

    return () => {
      clearTimeout(handler);
    };
  }, [value, pathname, router]); // Loại bỏ searchParams khỏi dependencies để tránh reset trang khi params khác thay đổi

  // Đồng bộ state khi URL search params thay đổi từ bên ngoài (ví dụ bấm Clear All)
  const currentUrlQuery = searchParams.get("q") || "";
  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setValue(currentUrlQuery);
    }, 0);
    return () => clearTimeout(syncTimer);
  }, [currentUrlQuery]);

  const handleClear = () => {
    setValue("");
    const params = new URLSearchParams(searchParamsRef.current.toString());
    params.delete("q");
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}` as RouterHref, { scroll: false });
    });
  };

  return (
    <div className="relative w-full max-w-lg">
      <div className="relative flex items-center">
        <label htmlFor="article-search" className="sr-only">
          {t("search_placeholder")}
        </label>
        <input
          id="article-search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("search_placeholder")}
          className="border-border focus:border-brand-darkred focus:ring-brand-darkred/15 h-11 w-full rounded-lg border bg-white pr-11 pl-10 text-base text-slate-800 placeholder:text-slate-600 focus:ring-3 focus:outline-none"
        />
        <Search className="absolute left-3.5 text-slate-600" size={17} aria-hidden="true" />

        {value && (
          <button
            onClick={handleClear}
            className="hover:text-brand-darkred absolute right-0 inline-flex size-11 items-center justify-center rounded-lg text-slate-600 transition-colors duration-150"
            type="button"
            aria-label={t("clear_all")}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
