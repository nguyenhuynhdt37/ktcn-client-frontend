import { getLanguageHeader } from "./server-api-helper";

interface FetchOptions extends RequestInit {
  revalidate?: number;
  tags?: string[];
  params?: Record<string, string | number | boolean | string[] | undefined | null>;
  forwardCookies?: boolean;
}

export const httpClient = {
  /**
   * Gọi HTTP GET Request bằng Fetch API dùng chung, tự động đính kèm locale header & base URL.
   * Hỗ trợ đầy đủ caching của Next.js (revalidate, tags).
   */
  async get<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
    const isServer = typeof window === "undefined";
    const apiBaseUrl = (isServer ? process.env.API_URL : null) || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const langHeader = await getLanguageHeader();
    
    const headers: Record<string, string> = {
      ...langHeader,
      ...(options.headers as Record<string, string>),
    };

    // Chuẩn hóa query parameters
    let url = `${apiBaseUrl}${path}`;
    const locale = (langHeader["Accept-Language"] || "vi").split("-")[0].toLowerCase();
    const params = {
      lang: locale === "en" ? "en" : "vi",
      ...options.params,
    };

    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          if (Array.isArray(val)) {
            queryParams.append(key, val.join(","));
          } else {
            queryParams.append(key, val.toString());
          }
        }
      });
      const queryStr = queryParams.toString();
      if (queryStr) {
        url += (url.includes("?") ? "&" : "?") + queryStr;
      }
    }

    const {
      revalidate,
      tags,
      forwardCookies,
      ...restOptions
    } = options;
    delete (restOptions as { params?: unknown }).params;

    const fetchOptions: RequestInit = {
      method: "GET",
      ...restOptions,
      headers,
      credentials: "include",
    };

    // Chỉ đọc và chuyển tiếp Cookie trên Server-side (SSR) khi được yêu cầu cụ thể (tránh làm mất tối ưu SSG của các trang tĩnh)
    let hasForwardedCookies = false;
    if (forwardCookies && typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieString = cookieStore.toString();
        if (cookieString) {
          headers["Cookie"] = cookieString;
          hasForwardedCookies = true;
        }
      } catch (error) {
        console.warn("Failed to read cookies on server side", error);
      }
    }

    // Đính kèm cấu hình cache của Next.js (không dùng shared Data Cache khi forwardCookies mang Cookie người dùng)
    if (hasForwardedCookies) {
      fetchOptions.cache = "no-store";
    } else if (revalidate !== undefined || tags !== undefined) {
      fetchOptions.next = {
        ...(revalidate !== undefined ? { revalidate } : {}),
        ...(tags !== undefined ? { tags } : {}),
      };
    }

    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      try {
        attempts++;
        const res = await fetch(url, fetchOptions);
        if (!res.ok) {
          console.warn(`HTTP Client GET [${res.status}] ${url}`);
          return null;
        }
        return await res.json();
      } catch (error) {
        if (attempts >= maxAttempts) {
          console.error(`HTTP Client GET Error for ${url} after ${maxAttempts} attempts:`, error);
          return null;
        }
        console.warn(`HTTP Client GET transient error for ${url} (attempt ${attempts}), retrying...`);
        // Đợi 100ms trước khi thử lại
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return null;
  },
};
