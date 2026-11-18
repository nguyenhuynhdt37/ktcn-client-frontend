"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ChevronRight, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { useArticleNotifications } from "../hooks/useArticleNotifications";

export function ClientNotificationBell() {
  const locale = useLocale();
  const t = useTranslations("notifications");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { items, readIds, unreadCount, isLoading, markRead, markAllRead } =
    useArticleNotifications(8);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="hover:text-brand-yellow relative inline-flex size-11 items-center justify-center rounded-md text-white/80 transition-colors duration-150"
        aria-label={`${t("bell_label")}${unreadCount ? `, ${t("new_count", { count: unreadCount })}` : ""}`}
        aria-expanded={isOpen}
        aria-controls="client-notification-panel"
      >
        <Bell className="size-[18px]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="bg-brand-yellow text-brand-darkred-dark absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="client-notification-panel"
          className="border-border bg-card text-foreground fixed inset-x-4 top-14 sm:absolute sm:top-[calc(100%+0.5rem)] sm:right-0 sm:left-auto sm:inset-x-auto z-[70] w-auto sm:w-[23rem] max-w-sm sm:max-w-none mx-auto sm:mx-0 overflow-hidden rounded-[var(--radius-lg)] border shadow-[var(--shadow-xl)]"
        >
          <div className="border-border flex min-h-14 items-center justify-between gap-3 border-b px-4">
            <div>
              <h2 className="font-semibold">{t("panel_title")}</h2>
              <p className="text-muted-foreground text-xs">{t("panel_description")}</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-brand-blue hover:bg-brand-blue/5 inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold"
              >
                <CheckCheck className="size-4" aria-hidden="true" />
                {t("mark_all_short")}
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {isLoading ? (
              <div className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 text-sm">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                {t("loading")}
              </div>
            ) : items.length === 0 ? (
              <div className="text-muted-foreground flex min-h-40 flex-col items-center justify-center px-5 text-center text-sm">
                <Bell className="mb-3 size-7 opacity-50" aria-hidden="true" />
                {t("empty")}
              </div>
            ) : (
              items.map((item) => {
                const isUnread = !readIds.has(item.id);
                return (
                  <Link
                    key={item.id}
                    href={{ pathname: "/tin-tuc/[slug]", params: { slug: item.slug } }}
                    onClick={() => {
                      markRead(item.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "border-border-subtle hover:bg-surface-hover group flex gap-3 border-b px-4 py-3.5 transition-colors last:border-b-0",
                      isUnread && "bg-brand-blue/[0.045]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-2 size-2 shrink-0 rounded-full",
                        isUnread ? "bg-brand-darkred" : "bg-border",
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "line-clamp-2 text-sm leading-5",
                          isUnread ? "font-semibold" : "text-muted-foreground",
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="text-muted-foreground mt-1 block text-xs">
                        {formatNotificationDate(item.published_at || item.created_at, locale)}
                      </span>
                    </span>
                    <ChevronRight
                      className="text-muted-foreground mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                );
              })
            )}
          </div>

          <div className="border-border bg-section-alt border-t p-2">
            <Link
              href="/thong-bao"
              onClick={() => setIsOpen(false)}
              className="text-brand-blue hover:bg-brand-blue/5 flex min-h-10 items-center justify-center rounded-md px-3 text-sm font-semibold"
            >
              {t("view_all")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function formatNotificationDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
