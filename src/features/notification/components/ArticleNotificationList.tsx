"use client";

import { Bell, CheckCheck, LoaderCircle, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useArticleNotifications } from "../hooks/useArticleNotifications";

export function ArticleNotificationList() {
  const locale = useLocale();
  const t = useTranslations("notifications");
  const {
    items,
    readIds,
    unreadCount,
    isLoading,
    hasError,
    markRead,
    markUnread,
    markAllRead,
    refresh,
  } = useArticleNotifications(30);

  if (isLoading) {
    return (
      <div className="border-border bg-card text-muted-foreground flex min-h-72 items-center justify-center gap-2 rounded-[var(--radius-lg)] border">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        {t("loading")}
      </div>
    );
  }

  if (hasError && items.length === 0) {
    return (
      <div className="border-border bg-card flex min-h-72 flex-col items-center justify-center rounded-[var(--radius-lg)] border p-6 text-center">
        <Bell className="text-muted-foreground size-8" aria-hidden="true" />
        <h2 className="text-foreground mt-4 text-lg font-semibold">{t("load_error_title")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t("load_error_description")}</p>
        <Button type="button" variant="outline" onClick={() => void refresh()} className="mt-5">
          <RefreshCw className="size-4" aria-hidden="true" />
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-[var(--radius-lg)] border shadow-[var(--shadow-sm)]">
      <div className="border-border flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            {unreadCount ? t("unread_count", { count: unreadCount }) : t("all_read")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">{t("device_note")}</p>
        </div>
        {unreadCount > 0 && (
          <Button type="button" variant="outline" onClick={markAllRead}>
            <CheckCheck className="size-4" aria-hidden="true" />
            {t("mark_all")}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground flex min-h-64 flex-col items-center justify-center p-6 text-center">
          <Bell className="mb-3 size-8 opacity-50" aria-hidden="true" />
          {t("empty")}
        </div>
      ) : (
        <div>
          {items.map((item) => {
            const isUnread = !readIds.has(item.id);
            return (
              <div
                key={item.id}
                className={cn(
                  "border-border-subtle hover:bg-surface-hover grid gap-3 border-b px-5 py-5 transition-colors last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6",
                  isUnread && "bg-brand-blue/[0.04]",
                )}
              >
                <Link
                  href={{ pathname: "/tin-tuc/[slug]", params: { slug: item.slug } }}
                  onClick={() => markRead(item.id)}
                  className="flex min-w-0 gap-3 rounded-md"
                >
                  <span
                    className={cn(
                      "mt-2 size-2.5 shrink-0 rounded-full",
                      isUnread ? "bg-brand-darkred" : "bg-border",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "text-foreground line-clamp-2 text-base leading-6",
                        isUnread ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.title}
                    </span>
                    {item.excerpt && (
                      <span className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-6">
                        {item.excerpt}
                      </span>
                    )}
                  </span>
                </Link>
                <span className="flex items-center justify-between gap-3 pl-5 sm:flex-col sm:items-end sm:pl-0">
                  <span className="text-muted-foreground text-sm whitespace-nowrap">
                    {formatDate(item.published_at || item.created_at, locale)}
                  </span>
                  <button
                    type="button"
                    onClick={() => (isUnread ? markRead(item.id) : markUnread(item.id))}
                    className="text-brand-blue hover:bg-brand-blue/5 min-h-9 rounded-md px-2 text-xs font-semibold"
                  >
                    {isUnread ? t("mark_read") : t("mark_unread")}
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
