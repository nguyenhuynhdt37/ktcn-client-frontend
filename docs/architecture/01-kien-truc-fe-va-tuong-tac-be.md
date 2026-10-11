# 🏛️ Kiến Trúc Hệ Thống & Cơ Chế Tương Tác Frontend - Backend
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Dự án: `ktcn-client-frontend` | Framework: **Next.js 16.2 (App Router)** | Backend: **FastAPI (REST)**

Tài liệu này phân tích chi tiết về kiến trúc phần mềm của cổng thông tin Frontend, mô hình **React Server Components (RSC)** kết hợp **Backend-For-Frontend (BFF)**, và cơ chế giao tiếp đa luồng giữa Trình duyệt người dùng, Máy chủ Next.js và Máy chủ FastAPI Backend.

---

## 1. Tổng Quan Kiến Trúc (Clean Architecture & Feature-First)

Mã nguồn Frontend được tổ chức theo nguyên tắc **Feature-First** (tập trung theo từng nghiệp vụ) kết hợp **Clean Architecture**:

```
src/
├── app/                  # App Router Layer: Routes, Layouts, Metadata, Error/Loading states
│   └── [locale]/         # Phân luồng đa ngôn ngữ (vi, en)
│       ├── (public)/     # Route group công khai cho cổng thông tin (Trang chủ, Tin tức, Giới thiệu...)
│       ├── layout.tsx    # Root layout xử lý fetch menu, theme, fonts, analytics, maintenance mode
│       ├── loading.tsx   # Skeleton loading toàn trang
│       └── error.tsx     # Global Error Boundary
├── features/             # Feature Layer: Đóng gói độc lập từng nghiệp vụ
│   ├── article/          # Quản lý tin tức, bài viết, mục lục, tác giả, views
│   ├── banner/           # Quản lý slider hero banner
│   ├── category/         # Cây danh mục phân cấp
│   ├── consultation/     # Tiếp nhận form tư vấn tuyển sinh
│   ├── department/       # Cơ cấu tổ chức khoa, viện, bộ môn
│   ├── lecturer/         # Hồ sơ cán bộ giảng viên, lý lịch khoa học
│   ├── menu/             # Hệ thống menu đa cấp (header, footer)
│   ├── notification/     # Web Push Notification & Tin vắn marquee
│   ├── program/          # Chương trình đào tạo đại học, sau đại học
│   └── language/         # Danh sách ngôn ngữ cấu hình từ backend
├── shared/               # Shared Layer: Tài nguyên dùng chung không chứa nghiệp vụ
│   ├── api/              # HTTP Clients (httpClient cho Server, axiosClient cho Client)
│   ├── components/       # UI Components dùng chung (Button, Breadcrumb, Dialog...)
│   ├── config/           # Kiểm định biến môi trường (Zod env validation)
│   ├── lib/              # Thư viện phụ trợ SEO, Schema.org generator
│   └── providers/        # React Context Providers (TanStack Query, NextIntl, Theme)
└── proxy.ts              # Proxy / Middleware xử lý URL rewrite, redirect và bảo mật headers
```

---

## 2. Luồng Dữ Liệu: Trình Duyệt ⟷ Next.js Server ⟷ FastAPI Backend

```
                                    KIẾN TRÚC TƯƠNG TÁC DỮ LIỆU
                                    
 [Client Browser]
        │
        │ 1. HTTP GET /vi/tin-tuc/khai-giang-2026
        ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ Next.js 16 Server (Node.js Runtime)                                    │
 │                                                                        │
 │  1. Routing & Proxy (src/proxy.ts): Nhận diện locale = 'vi'            │
 │  2. Server Component (src/app/[locale]/(public)/tin-tuc/[slug]/page):   │
 │     - Gọi generateMetadata() để chuẩn bị SEO                           │
 │     - Gọi httpClient.get('/api/v1/portal/articles/khai-giang-2026')   │
 │                                                                        │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │ 2. Fetch REST API
                                    │    Headers: Accept-Language: vi
                                    │    Params:  lang=vi
                                    ▼
                     ┌──────────────────────────────┐
                     │ FastAPI Backend (Python)     │
                     │  - Kiểm tra Redis Cache      │
                     │  - Truy vấn PostgreSQL       │
                     │  - Tăng lượt xem (view_count)│
                     │  - Trả JSON kết quả          │
                     └──────────────┬───────────────┘
                                    │
                                    │ 3. JSON Data
                                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ Next.js 16 Server                                                      │
 │  - Ánh xạ dữ liệu đa ngữ qua mapPortalArticleToFE()                    │
 │  - Trích xuất heading <h2>, <h3> thành Table of Contents               │
 │  - Sinh JSON-LD Schema.org (Article & BreadcrumbList)                  │
 │  - Render HTML tĩnh kèm RSC payload payload                            │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 4. HTML + Hydration Script
                                    ▼
 [Client Browser]
        │
        │ 5. Tương tác động ở Client (Client Component Events):
        │    - Submit form tư vấn (POST /api/v1/portal/consultations)
        │    - Đăng ký Web Push   (POST /api/v1/portal/notifications/subscribe)
        │    - Lấy visitor count  (GET /api/v1/portal/statistics)
        ▼
   [FastAPI Backend] (Trình duyệt gọi trực tiếp qua axiosClient)
```

---

## 3. Cấu Hình & So Sánh Hai Bộ API Client

### 3.1. `httpClient.ts` — Dành Riêng Cho Server Components (RSC)
Tệp mã nguồn: [`src/shared/api/httpClient.ts`](../../src/shared/api/httpClient.ts)

```typescript
export const httpClient = {
  async get<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
    // 1. Phân biệt môi trường để xác định URL Backend chính xác:
    const isServer = typeof window === "undefined";
    const apiBaseUrl = (isServer ? process.env.API_URL : null) 
      || process.env.NEXT_PUBLIC_API_URL 
      || "http://localhost:8000";

    // 2. Tự động đọc locale từ ngữ cảnh Next.js Server qua next-intl/server:
    const langHeader = await getLanguageHeader();
    
    // 3. Tự động gắn query param lang=vi/en và Header Accept-Language:
    // ...
    
    // 4. Hỗ trợ On-Demand Caching của Next.js:
    if (options.revalidate !== undefined || options.tags !== undefined) {
      fetchOptions.next = {
        revalidate: options.revalidate,
        tags: options.tags,
      };
    }

    // 5. Cơ chế Retry thông minh khi gặp lỗi mạng tạm thời:
    // Thử lại tối đa 2 lần, chờ 100ms trước lần thử tiếp theo
    // ...
  }
}
```

**Đặc điểm nổi bật:**
- **Không bao giờ làm sập máy chủ**: Khi API trả về lỗi 4xx/5xx hoặc timeout, hàm bắt lỗi và trả về `null` thay vì quăng Exception unhandled, cho phép UI hiển thị màn hình fallback trang nhã.
- **Tự động gắn Locale**: Lập trình viên không cần truyền tay mã ngôn ngữ trong từng lời gọi hàm.
- **Hỗ trợ Forward Cookies**: Cho phép truyền session cookie của client xuống backend để đếm lượt xem (view count) hoặc xác thực.

---

### 3.2. `axiosClient.ts` — Dành Riêng Cho Client Components
Tệp mã nguồn: [`src/shared/api/axios-client.ts`](../../src/shared/api/axios-client.ts)

```typescript
export const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
```

**Tính năng Interceptors:**
- **Request Interceptor**:
  - Tự động lấy token JWT từ `localStorage.getItem("token")` và chèn vào header `Authorization: Bearer <token>`.
  - Tự động trích xuất ngôn ngữ hiện tại của người dùng từ đường dẫn URL (`/vi` hoặc `/en`), Cookie `locale`, hoặc `localStorage` để chèn vào `Accept-Language`.
- **Response Interceptor**:
  - Tự động bắt lỗi HTTP `401 Unauthorized` để điều hướng đăng nhập hoặc xóa token phiên.
  - Bắt lỗi HTTP `403 Forbidden` để ngăn chặn truy cập trái phép.

---

## 4. Chiến Lược Caching & Incremental Static Regeneration (ISR)

Next.js 16 cung cấp hệ thống Data Cache mạnh mẽ giúp tối ưu hóa hiệu năng và giảm 90% tải cho FastAPI:

### 4.1. Bảng Cấu Hình TTL Cho Từng Nhóm Nghiệp Vụ
| Nghiệp vụ | Chu kỳ làm mới (`revalidate`) | Thẻ nhận diện (`tags`) | Lý do kiến trúc |
| :--- | :--- | :--- | :--- |
| **Menu điều hướng** | `60s` | `['menu-header', 'menu-footer']` | Cần cập nhật tương đối nhanh khi quản trị viên thay đổi cấu trúc liên kết |
| **Banners trang chủ** | `1800s` (30 phút) | `['banners']` | Banner thường có tính cố định theo chiến dịch, ít thay đổi liên tục |
| **Danh sách tin tức** | `300s` (5 phút) | `['articles']` | Cân bằng giữa tính kịp thời của tin tức và hiệu năng tải trang |
| **Chi tiết bài viết** | `600s` (10 phút) | `['article-${slug}']` | Bài viết sau khi phát hành ít khi sửa đổi nội dung, cần tốc độ phản hồi cực đại |
| **Cây danh mục bài viết** | `600s` (10 phút) | `['categories']` | Danh mục tin tức có tính cấu trúc cố định |
| **Cơ cấu tổ chức & Cán bộ** | `300s` (5 phút) | `['department-${slug}', 'staffs']` | Dữ liệu nhân sự học vị ổn định |
| **Chương trình đào tạo** | `300s` (5 phút) | `['programs']` | Khung chương trình đào tạo sinh viên |
| **Danh sách ngôn ngữ** | `3600s` (1 giờ) | `['languages']` | Danh sách ngôn ngữ hệ thống gần như cố định |

### 4.2. Cơ Chế Xóa Cache Chủ Động (On-Demand Revalidation)
Khi quản trị viên đăng bài viết mới hoặc sửa menu trên Backend Admin, Backend có thể kích hoạt Webhook gửi tín hiệu đến route revalidate của Next.js kèm header `x-revalidation-token: <REVALIDATION_TOKEN>` để xóa cache tức thì của tag cụ thể (`revalidateTag("menu-header")` hoặc `revalidateTag("article-slug")`) mà không cần chờ hết chu kỳ TTL.

---

## 5. Cơ Chế Dự Phòng & Chế Độ Bảo Trì (Graceful Maintenance Mode)

Một thách thức lớn trong mô hình Server Components là nếu Backend API sập hoặc không phản hồi trong quá trình render Layout gốc (`src/app/[locale]/layout.tsx`), ứng dụng có thể gặp lỗi `Server Error (500)`.

Để khắc phục điều này, dự án triển khai kiến trúc **Circuit Breaker UI**:

1. Tại `layout.tsx`, mọi lời gọi API ban đầu (Menu, Danh sách ngôn ngữ) đều được đặt trong khối `try/catch`:
```typescript
try {
  const [headerRes, footerRes, langRes] = await Promise.all([
    menuService.getMenuTree("header").catch(() => null),
    menuService.getMenuTree("footer").catch(() => null),
    languageService.getLanguages().catch(() => []),
  ]);
  
  if (langRes.length === 0 || !headerRes) {
    isMaintenance = true;
  }
} catch (err) {
  isMaintenance = true;
}
```

2. Nếu Backend offline:
   - Hệ thống không quăng lỗi crash.
   - Thay vào đó, trả về mã trạng thái nhẹ nhàng hiển thị màn hình **"Hệ thống đang bảo trì" (System Under Maintenance)**.
   - Component Client [`MaintenanceHandler.tsx`](../../src/shared/components/layout/MaintenanceHandler.tsx) sẽ định kỳ kiểm tra sức khỏe của Backend trong nền và tự động tải lại trang ngay khi Backend hoạt động trở lại.
