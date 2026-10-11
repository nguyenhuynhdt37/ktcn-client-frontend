# 🌐 Đa Ngôn Ngữ (i18n): Cơ Chế Đồng Bộ Giữa Next.js & Backend
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Nghiệp vụ: **Internationalization (i18n)** | Thư viện: **next-intl 4.13** | Backend: **FastAPI Polyglot**

Tài liệu này mô tả chi tiết kiến trúc đa ngôn ngữ của dự án, cơ chế tiền tố URL (`/[locale]/...`), cách thức tự động đồng bộ mã ngôn ngữ giữa Next.js và Backend FastAPI qua HTTP Headers và Query Parameters, cũng như giải pháp bóc tách dữ liệu an toàn tránh lỗi màn hình trắng.

---

## 1. Cấu Hình Định Tuyến & Ngôn Ngữ

Dự án hỗ trợ 2 ngôn ngữ chính:
- **`vi`**: Tiếng Việt (Ngôn ngữ mặc định của nhà trường).
- **`en`**: Tiếng Anh (English).

Tệp cấu hình định tuyến: [`src/i18n/routing.ts`](../../src/i18n/routing.ts)

```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "always", // Mọi URL luôn có tiền tố: /vi/... hoặc /en/...
});
```

---

## 2. Proxy Middleware & Phân Luồng URL (`src/proxy.ts`)

Trong Next.js 16, tệp [`src/proxy.ts`](../../src/proxy.ts) chịu trách nhiệm:
1. **Tự động bắt ngôn ngữ**: Phân tích URL của người dùng, nếu người dùng truy cập trang chủ không có tiền tố (`/`), tự động chuyển hướng 307 về `/${locale}` theo cài đặt ưu tiên của trình duyệt.
2. **Tương thích ngược URL cũ**: Chuyển hướng các URL tin tức cũ sang định dạng mới:
   - `/tin-tuc` ➔ `/vi/tim-kiem` (Mã 301 Permanent Redirect)
   - `/tin-tuc/[slug]` ➔ `/vi/[slug]`
3. **Bảo mật**: Gắn các HTTP Headers an ninh (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).

---

## 3. Cơ Chế Đồng Bộ Hai Chiều Với Backend FastAPI

Để Backend FastAPI trả về đúng bản dịch ngôn ngữ, Frontend triển khai cơ chế đồng bộ tự động 100% không cần truyền tham số thủ công:

```
                  CƠ CHẾ ĐỒNG BỘ NGÔN NGỮ HAI CHIỀU
                  
┌───────────────────────────────┐               ┌───────────────────────────────┐
│ Next.js 16 Server Component   │               │ FastAPI Backend REST Server   │
│                               │               │                               │
│ - Đọc locale từ Request       │               │ - Nhận diện Header & Param    │
│ - httpClient.get()            │  HTTP GET     │ - Trả JSON bài viết tương ứng │
│   Headers:                    │ ────────────> │   bằng tiếng Việt hoặc        │
│     Accept-Language: "en"     │               │   bằng tiếng Anh              │
│   Params:                     │ <──────────── │                               │
│     ?lang=en                  │  JSON Payload │                               │
└───────────────────────────────┘               └───────────────────────────────┘

┌───────────────────────────────┐               ┌───────────────────────────────┐
│ Client Component (Trình duyệt)│               │ FastAPI Backend REST Server   │
│                               │               │                               │
│ - axiosClient Interceptor     │  AJAX Request │ - Nhận diện Accept-Language   │
│   Đọc URL: /en/tu-van...      │ ────────────> │ - Xử lý thông báo theo locale │
│   Gắn Header:                 │ <──────────── │ - Trả thông điệp phù hợp      │
│     Accept-Language: "en"     │               │                               │
└───────────────────────────────┘               └───────────────────────────────┘
```

### 3.1. Phía Server Components (`httpClient.ts` & `server-api-helper.ts`)
Tệp [`src/shared/api/server-api-helper.ts`](../../src/shared/api/server-api-helper.ts) cung cấp hàm đọc locale an toàn phía Server:
```typescript
import { getLocale } from "next-intl/server";

export async function getLanguageHeader(): Promise<Record<string, string>> {
  try {
    const locale = await getLocale();
    return { "Accept-Language": locale };
  } catch (error) {
    return { "Accept-Language": "vi" };
  }
}
```
Tại [`httpClient.ts`](../../src/shared/api/httpClient.ts), mỗi request `GET` tự động:
1. Gắn Header `Accept-Language: vi` (hoặc `en`).
2. Gắn Query Param `?lang=vi` (hoặc `?lang=en`).

### 3.2. Phía Client Components (`axiosClient.ts`)
Tại [`src/shared/api/axios-client.ts`](../../src/shared/api/axios-client.ts), Request Interceptor tự động bóc tách ngôn ngữ của phiên duyệt web:
```typescript
function getClientLocale(): string {
  if (typeof window === "undefined") return "vi";

  // 1. Lấy từ đường dẫn URL (segment đầu tiên, ví dụ /en/tu-van -> en)
  const pathname = window.location.pathname;
  const segments = pathname.split("/");
  if (segments[1] === "vi" || segments[1] === "en") return segments[1];

  // 2. Fallback sang Cookie 'locale' hoặc 'NEXT_LOCALE'
  const localeMatch = document.cookie.match(/(^|;)\s*locale\s*=\s*([^;]+)/);
  if (localeMatch) return localeMatch[2];

  return "vi";
}

axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.headers["Accept-Language"] = getClientLocale();
  }
  return config;
});
```

---

## 4. Helper Bóc Tách Trường Đa Ngữ An Toàn (`getLocalizedField`)

Backend có thể trả dữ liệu theo 2 định dạng:
1. Bản ghi phẳng có trường hậu tố: `title_vi`, `title_en`.
2. Đối tượng lồng nhau: `title: { vi: "...", en: "..." }`.

Helper [`getLocalizedField()`](../../src/features/article/utils/map-article.ts) xử lý an toàn:
```typescript
export function getLocalizedField<T = string>(
  obj: any,
  field: string,
  locale: string,
  fallback = ""
): T {
  if (!obj) return fallback as unknown as T;

  // 1. Kiểm tra đối tượng đa ngữ dạng { vi: "...", en: "..." }
  if (obj[field] && typeof obj[field] === "object") {
    return obj[field][locale] || obj[field]["vi"] || fallback;
  }

  // 2. Kiểm tra trường hậu tố dạng title_en / title_vi
  const localizedKey = `${field}_${locale}`;
  if (obj[localizedKey] !== undefined && obj[localizedKey] !== null) {
    return obj[localizedKey];
  }

  // 3. Fallback về trường gốc
  return obj[field] ?? fallback;
}
```
> **Lợi ích**: Ngăn chặn 100% lỗi `Cannot read properties of undefined` khi một bài viết chưa kịp dịch sang tiếng Anh, tự động fallback về tiếng Việt một cách trang nhã.
