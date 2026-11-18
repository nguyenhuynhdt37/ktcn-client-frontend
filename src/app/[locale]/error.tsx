"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function Error({ error, unstable_retry }: ErrorProps) {
  const t = useTranslations("common");

  useEffect(() => {
    // Ghi nhận lỗi hệ thống (có thể tích hợp Sentry, v.v.)
    console.error("System Error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card chính */}
        <div className="relative overflow-hidden border border-border bg-white p-8 shadow-sm rounded-xl sm:p-10">
          {/* Thanh trang trí đỏ trên cùng */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-brand-darkred via-red-500 to-orange-400" />

          {/* Icon cảnh báo */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
            <AlertTriangle className="h-8 w-8 text-brand-darkred" strokeWidth={1.8} />
          </div>

          {/* Tiêu đề */}
          <h1 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {t("system_error_title")}
          </h1>

          {/* Mô tả */}
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
            {t("system_error_desc")}
          </p>

          {/* Mã lỗi */}
          {error.digest && (
            <div className="mx-auto mt-4 w-fit rounded-md bg-slate-50 px-3 py-1.5 text-center">
              <span className="text-xs font-medium text-slate-600">
                {t("error_code")}:{" "}
              </span>
              <code className="text-xs font-mono font-semibold text-slate-600">
                {error.digest}
              </code>
            </div>
          )}

          {/* Đường kẻ phân cách */}
          <div className="mx-auto mt-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Hành động */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => unstable_retry()}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-darkred px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-darkred/90 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
              {t("retry")}
            </button>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("go_home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
