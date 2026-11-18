import { httpClient } from "@/shared/api/httpClient";
import { env } from "@/shared/config/env";
import { safePortalHref } from "@/shared/lib/security";
import type { SiteSettings } from "../types/setting.types";

export const settingService = {
  async getSiteSettings(): Promise<SiteSettings | null> {
    return httpClient.get<SiteSettings>("/api/v1/portal/settings", {
      revalidate: 60,
      tags: ["site-settings"],
    });
  },
};

export function resolveSettingMediaUrl(urlOrKey?: string | null): string | null {
  if (!urlOrKey) return null;
  const val = urlOrKey.trim();
  if (!val) return null;
  if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:")) {
    return val;
  }
  const apiBase = (env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
  if (val.startsWith("/api/")) {
    return `${apiBase}${val}`;
  }
  if (val.startsWith("/")) {
    return val;
  }
  return `${apiBase}/api/v1/portal/media/file/${val.replace(/^\/+/, "")}`;
}

export function sanitizeExternalUrl(url?: string | null, fallback = "#"): string {
  return safePortalHref(url, fallback);
}
