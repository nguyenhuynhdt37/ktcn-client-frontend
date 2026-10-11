# ⚡ KTCN Frontend Quick Boost & Frontend-Backend Interaction Guide
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Dự án: `ktcn-client-frontend` (Next.js 16 + React 19 + Tailwind CSS v4)  
> Tài liệu tóm lược toàn diện từ **Khởi động nhanh**, **Cấu hình môi trường**, **Kiến trúc Next.js 16 RSC**, đến **Toàn bộ luồng tương tác giữa Frontend và Backend FastAPI**.

---

## 📑 Mục Lục Nhanh
1. [Khởi Động Siêu Tốc (Quick Start Commands)](#1-khởi-động-siêu-tốc-quick-start-commands)
2. [Cấu Hình Môi Trường & Biến Hệ Thống (.env)](#2-cấu-hình-môi-trường--biến-hệ-thống-env)
3. [Kiến Trúc & Cơ Chế Tương Tác Frontend - Backend](#3-kiến-trúc--cơ-chế-tương-tác-frontend---backend)
   - [3.1. Luồng Dữ Liệu: Browser ⟷ Next.js RSC Server ⟷ FastAPI Backend](#31-luồng-dữ-liệu-browser---nextjs-rsc-server---fastapi-backend)
   - [3.2. Cấu Trúc Hai Bộ API Client (`httpClient` vs `axiosClient`)](#32-cấu-trúc-hai-bộ-api-client-httpclient-vs-axiosclient)
   - [3.3. Chiến Lược Caching & Tái Tạo Dữ Liệu (ISR / Revalidation)](#33-chiến-lược-caching--tái-tạo-dữ-liệu-isr--revalidation)
   - [3.4. Phòng Vệ Hệ Thống & Chế Độ Bảo Trì (Graceful Maintenance Mode)](#34-phòng-vệ-hệ-thống--chế-độ-bảo-trì-graceful-maintenance-mode)
4. [Mô Tả Chi Tiết FE Đang Làm Gì Với Backend Theo Từng Tính Năng](#4-mô-tả-chi-tiết-fe-đang-làm-gì-với-backend-theo-từng-tính-năng)
   - [4.1. Menu Điều Hướng (Header & Footer Multi-level Trees)](#41-menu-điều-hướng-header--footer-multi-level-trees)
   - [4.2. Banners & Slider Hero Trang Chủ](#42-banners--slider-hero-trang-chủ)
   - [4.3. Quản Lý Tin Tức, Bài Viết, Lượt Xem & SEO Động](#43-quản-lý-tin-tức-bài-viết-lượt-xem--seo-động)
   - [4.4. Chương Trình Đào Tạo & Đăng Ký Tư Vấn Tuyển Sinh](#44-chương-trình-đào-tạo--đăng-ký-tư-vấn-tuyển-sinh)
   - [4.5. Cơ Cấu Tổ Chức Đơn Vị & Hồ Sơ Cán Bộ Giảng Viên](#45-cơ-cấu-tổ-chức-đơn-vị--hồ-sơ-cán-bộ-giảng-viên)
   - [4.6. Cơ Chế Đa Ngôn Ngữ Đồng Bộ (Next-Intl ⟷ Backend i18n)](#46-cơ-chế-đa-ngôn-ngữ-đồng-bộ-next-intl---backend-i18n)
   - [4.7. Web Push Notifications (VAPID) & Thống Kê Truy Cập (Visitor Counter)](#47-web-push-notifications-vapid--thống-kê-truy-cập-visitor-counter)
5. [Đóng Gói & Triển Khai Với Docker](#5-đóng-gói--triển-khai-với-docker)
6. [Bảng Tra Cứu Sự Cố Thường Gặp (Troubleshooting)](#6-bảng-tra-cứu-sự-cố-thường-gặp-troubleshooting)

---

## 1. Khởi Động Siêu Tốc (Quick Start Commands)

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản `>= 20.x` (Khuyến nghị **Node.js 22 LTS** để tương thích tối đa với Dockerfile và React 19).
- **pnpm**: Phiên bản `>= 9.x` hoặc `10.x`.
  ```bash
  # Kích hoạt pnpm qua Corepack (tích hợp sẵn trong Node.js)
  corepack enable
  corepack prepare pnpm@latest --activate
  ```

### Các Bước Khởi Chạy Trong 3 Bước
```bash
# Bước 1: Clone và di chuyển vào thư mục frontend
cd /Users/huynh/projects/KTCN/ktcn-client-frontend

# Bước 2: Cài đặt các gói phụ thuộc
pnpm install

# Bước 3: Khởi chạy môi trường phát triển (Development Server)
pnpm dev
```
Sau khi chạy, ứng dụng sẽ sẵn sàng tại:
- **Trang chủ Tiếng Việt**: [http://localhost:3000/vi](http://localhost:3000/vi)
- **Trang chủ Tiếng Anh**: [http://localhost:3000/en](http://localhost:3000/en)

### Các Lệnh Thao Tác Thường Dùng
| Lệnh | Ý nghĩa | Chi tiết kỹ thuật |
| :--- | :--- | :--- |
| `pnpm dev` | Chạy dev server | Hot Module Replacement (HMR) tại cổng `3000` |
| `pnpm build` | Đóng gói production | Sinh bản build tối ưu `standalone` tại `.next/standalone` |
| `pnpm start` | Chạy bản build | Khởi chạy server production sau khi đã chạy `pnpm build` |
| `pnpm lint` | Kiểm tra cú pháp | Kiểm tra bằng ESLint 9 với cấu hình Next.js 16 |
| `pnpm format` | Định dạng mã nguồn | Prettier tự động căn chỉnh code và sắp xếp Tailwind class |

---

## 2. Cấu Hình Môi Trường & Biến Hệ Thống (.env)

Tệp `.env` hoặc `.env.local` tại thư mục gốc quản lý các biến môi trường cần thiết:

```ini
# ==============================================================================
# KTCN CLIENT FRONTEND ENVIRONMENT CONFIGURATION
# ==============================================================================

# URL API của Backend FastAPI (Client Browser & Server Component đều có thể dùng)
NEXT_PUBLIC_API_URL=http://localhost:8000

# URL nội bộ khi gọi giữa các container Docker (tùy chọn cho Server-Side Fetch)
API_URL=http://localhost:8000

# Tên miền chính thức của Frontend (Phục vụ SEO Canonical URL, OpenGraph, Sitemap)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Mã khóa bí mật xác thực On-Demand ISR Revalidation từ Webhook Backend
REVALIDATION_TOKEN=dev_revalidation_token_123

# Môi trường chạy
NODE_ENV=development
```

### Quy Tắc Biến Môi Trường:
- Mọi biến có tiền tố `NEXT_PUBLIC_` sẽ được nhúng trực tiếp vào bundle phía trình duyệt (Client-side).
- Biến không có tiền tố `NEXT_PUBLIC_` (như `REVALIDATION_TOKEN`, `API_URL`) chỉ tồn tại trên **Node.js runtime của Next.js Server**, đảm bảo bí mật an toàn tuyệt đối.
- Biến môi trường được kiểm định an toàn tại lúc biên dịch bằng Zod Schema tại [`src/shared/config/env.ts`](../src/shared/config/env.ts).

---

## 3. Kiến Trúc & Cơ Chế Tương Tác Frontend - Backend

### 3.1. Luồng Dữ Liệu: Browser ⟷ Next.js RSC Server ⟷ FastAPI Backend

Dự án áp dụng mô hình **React Server Components (RSC) kết hợp Backend-for-Frontend (BFF)**:

```
┌─────────────────┐           ┌────────────────────────────────┐           ┌─────────────────┐
│                 │  Request  │      Next.js 16 Server         │  API Call │                 │
│  Client Browser │ ────────> │   - Routing proxy ([locale])   │ ────────> │ FastAPI Backend │
│  (Người dùng)   │           │   - Server Components (RSC)    │ (REST)    │ (Python 3.12)   │
│                 │ <──────── │   - ISR / Data Cache           │ <──────── │ (Port 8000)     │
│                 │  HTML+RSC │   - Dynamic SEO & Schema JSON  │  JSON     │                 │
└─────────────────┘           └────────────────────────────────┘           └─────────────────┘
         ▲                                                                          ▲
         │                                                                          │
         └────────────────────── Client Direct HTTP ────────────────────────────────┘
                         (Axios: Submit Tư vấn, Web Push, Visitor Counter)
```

1. **Luồng Server-Side Rendering (SSR / RSC):**
   - Người dùng truy cập URL (ví dụ: `https://ktcn.vinhuni.edu.vn/vi/tin-tuc/khai-giang-nam-hoc-moi`).
   - Next.js Proxy/Routing bắt locale, điều hướng tới Server Component `ArticleDetailPage`.
   - Next.js Server trực tiếp gọi API Backend FastAPI: `GET /api/v1/portal/articles/khai-giang-nam-hoc-moi` bằng Fetch API nội bộ (`httpClient`).
   - Dữ liệu JSON được Next.js Server chuyển đổi thành giao diện HTML hoàn chỉnh, bổ sung thẻ `<script type="application/ld+json">` chứa SEO Schema.
   - Trình duyệt nhận ngay mã HTML đầy đủ, giúp hiển thị tức thì (FCP/LCP tối ưu) và bot tìm kiếm Google cào dữ liệu hoàn hảo 100%.

2. **Luồng Client Interactive (CSR):**
   - Khi người dùng gửi form Đăng ký tư vấn tuyển sinh, Đăng ký nhận thông báo đẩy Web Push, hoặc ghi nhận lượt xem thống kê Visitor:
   - Các Client Components sử dụng `axiosClient` phát request AJAX trực tiếp từ trình duyệt tới FastAPI Backend (`NEXT_PUBLIC_API_URL`).

---

### 3.2. Cấu Trúc Hai Bộ API Client (`httpClient` vs `axiosClient`)

Dự án phân tách mạch lạc hai công cụ gọi API tùy theo ngữ cảnh thực thi:

#### A. `httpClient` ([`src/shared/api/httpClient.ts`](../src/shared/api/httpClient.ts)) - Chuyên Dụng Cho Server Components (RSC)
- Sử dụng hàm `fetch` bản địa của JavaScript / Next.js.
- **Tự động nhận diện ngôn ngữ**: Gọi `getLanguageHeader()` từ `next-intl/server` để gắn header `Accept-Language: vi|en` và param `lang=vi|en`.
- **Hỗ trợ cơ chế Cache Next.js**: Nhận tham số `{ revalidate: number, tags: string[] }`.
- **Cơ chế Retry thông minh**: Tự động thử lại tối đa 2 lần khi gặp sự cố mạng ngắt quãng (transient network glitch) với độ trễ 100ms.
- **Forward Cookies an toàn**: Tự động đọc và chuyển tiếp cookie phiên (Session Cookie) khi cần bảo toàn lượt đếm xem bài viết hoặc xác thực.

#### B. `axiosClient` ([`src/shared/api/axios-client.ts`](../src/shared/api/axios-client.ts)) - Chuyên Dụng Cho Client Components
- Cấu hình sẵn `timeout: 10000ms`, `withCredentials: true`.
- **Request Interceptor**:
  - Tự động lấy JWT token từ `localStorage` và đính kèm vào header `Authorization: Bearer <token>`.
  - Tự động bóc tách ngôn ngữ hiện tại của client từ URL path (`/vi/...` hoặc `/en/...`), Cookie `locale`, Cookie `NEXT_LOCALE`, hoặc `localStorage` và gắn vào `Accept-Language`.
- **Response Interceptor**:
  - Bắt lỗi HTTP tập trung: Mã `401 Unauthorized` (điều hướng đăng nhập / xóa session) và `403 Forbidden`.

---

### 3.3. Chiến Lược Caching & Tái Tạo Dữ Liệu (ISR / Revalidation)

Để giảm tải tối đa cho máy chủ FastAPI và cơ sở dữ liệu PostgreSQL trong khi vẫn đảm bảo dữ liệu luôn mới, FE cấu hình thời gian sống bộ nhớ đệm (TTL) chi tiết:

| Dữ liệu nghiệp vụ | Endpoint API | TTL Cache (`revalidate`) | Thẻ Cache (`tags`) | Mục đích |
| :--- | :--- | :--- | :--- | :--- |
| **Cây Menu Navigation** | `/api/v1/portal/menus/{code}/tree` | **60 giây** | `menu-${code}` | Menu thay đổi nhanh khi admin sửa cấu trúc |
| **Danh sách Banners** | `/api/v1/portal/banners` | **1800 giây (30 phút)** | `banners` | Banner ít thay đổi, cần tải cực nhanh |
| **Danh sách Bài viết** | `/api/v1/portal/articles` | **300 giây (5 phút)** | `articles` | Tin tức cập nhật thường xuyên |
| **Chi tiết Bài viết** | `/api/v1/portal/articles/{slug}` | **600 giây (10 phút)** | `article-${slug}` | Tối ưu SEO, bài viết đã đăng ít sửa |
| **Cây Danh mục** | `/api/v1/portal/categories/tree` | **600 giây (10 phút)** | `categories` | Cấu trúc chuyên mục cố định |
| **Cơ cấu Đơn vị/Bộ môn** | `/api/v1/portal/departments/{slug}`| **300 giây (5 phút)** | `department-${slug}` | Thông tin khoa/bộ môn |
| **Hồ sơ Giảng viên** | `/api/v1/portal/staffs/{slug}` | **300 giây (5 phút)** | `staff-${slug}` | Danh sách nhân sự & học vị |
| **Chương trình Đào tạo** | `/api/v1/portal/programs` | **300 giây (5 phút)** | `programs` | Khung CTĐT, chuẩn đầu ra |
| **Cấu hình Ngôn ngữ** | `/api/v1/portal/languages` | **3600 giây (1 giờ)** | `languages` | Danh sách ngôn ngữ hệ thống |

---

### 3.4. Phòng Vệ Hệ Thống & Chế Độ Bảo Trì (Graceful Maintenance Mode)

Nếu Backend FastAPI gặp sự cố kỹ thuật (bảo trì database, khởi động lại container, mất kết nối):
- Root Layout ([`src/app/[locale]/layout.tsx`](../src/app/[locale]/layout.tsx)) bao bọc toàn bộ khối fetch dữ liệu menu/ngôn ngữ trong khối `try/catch`.
- Khi không kết nối được tới Backend, hệ thống kích hoạt cờ `isMaintenance = true`.
- Giao diện người dùng sẽ hiển thị màn hình **"Hệ thống đang bảo trì" (System Under Maintenance)** chuẩn mực, chuyên nghiệp với nút chuyển đổi ngôn ngữ, kèm component [`MaintenanceHandler`](../src/shared/components/layout/MaintenanceHandler.tsx) tự động kiểm tra phục hồi mà **không để lộ lỗi 500 hay crash màn hình trắng**.

---

## 4. Mô Tả Chi Tiết FE Đang Làm Gì Với Backend Theo Từng Tính Năng

### 4.1. Menu Điều Hướng (Header & Footer Multi-level Trees)
- **File Service**: [`src/features/menu/services/menuService.ts`](../src/features/menu/services/menuService.ts)
- **Backend API**: `GET /api/v1/portal/menus/{code}/tree?revision=6` (`code = "header" | "footer"`)
- **FE Đang Làm Gì**:
  1. Root Layout gọi song song lấy 2 cây menu: `menuService.getMenuTree("header")` và `menuService.getMenuTree("footer")`.
  2. Hàm `resolveMenuTreeSlugs()` trên FE tự động đối chiếu các menu item kiểu `ARTICLE` / `PAGE` với danh sách bài viết từ Backend để điền slug chính xác, hoặc chuyển tiêu đề tiếng Việt thành URL slug chuẩn SEO nếu thiếu link.
  3. Header Menu component hiển thị thanh điều hướng đa cấp:
     - Trên Desktop: Render Mega Menu hoặc Dropdown đa cấp kèm icon tương ứng.
     - Trên Mobile: Render Mobile Drawer Menu dạng Accordion đệ quy mở/đóng mượt mà.
  4. Hỗ trợ đa dạng loại liên kết: `CATEGORY` (danh mục), `ARTICLE` (bài viết), `PAGE` (trang tĩnh), `EXTERNAL_LINK` (liên kết ngoài mở tab mới an toàn).

---

### 4.2. Banners & Slider Hero Trang Chủ
- **File Service**: [`src/features/banner/services/bannerService.ts`](../src/features/banner/services/bannerService.ts)
- **Backend API**: `GET /api/v1/portal/banners?position=HOME_HERO`
- **FE Đang Làm Gì**:
  1. Trang chủ `src/app/[locale]/(public)/page.tsx` gọi `bannerService.getBanners(BannerPosition.HOME_HERO)`.
  2. Component `HomeHeroWidget` sử dụng thư viện **Embla Carousel** kết hợp Autoplay để tạo hiệu ứng chuyển slide banner tự động.
  3. Tối ưu ảnh với `next/image`: Tự động áp dụng responsive sizes, ảnh đầu tiên được đặt thuộc tính `priority` để tối ưu chỉ số LCP của Google Lighthouse.
  4. Đọc trường song ngữ `title` và `subtitle` theo locale của người dùng. Nếu có `link_url`, render liên kết điều hướng mượt mà với `next/link`.

---

### 4.3. Quản Lý Tin Tức, Bài Viết, Lượt Xem & SEO Động
- **File Service**: [`src/features/article/services/articleService.ts`](../src/features/article/services/articleService.ts)
- **Backend API**:
  - `GET /api/v1/portal/articles`: Lấy danh sách bài viết phân trang, tìm kiếm, lọc danh mục.
  - `GET /api/v1/portal/articles/{slug}`: Lấy chi tiết bài viết theo slug đường dẫn.
  - `GET /api/v1/portal/categories/{slug}/articles`: Lấy bài viết theo chuyên mục cụ thể.
  - `GET /api/v1/portal/tags`: Lấy danh sách hashtag nổi bật.
- **FE Đang Làm Gì**:
  1. **Danh sách bài viết & Phân trang**:
     - Hỗ trợ đầy đủ bộ lọc: `page`, `page_size`, `search`, `category_slug`, `tag_slug`, `sort_by`, `sort_dir`.
     - Chuyển đổi dữ liệu backend sang định dạng FE qua helper `mapPortalArticleToFE()`.
  2. **Chi tiết bài viết (`tin-tuc/[slug]/page.tsx`)**:
     - Lấy chi tiết bài viết, tự động phân tích các thẻ heading `<h2>`, `<h3>` bằng helper `parseHeadings()` để tự động tạo Mục Lục Nội Dung (Table of Contents) ở cột bên trái.
     - Hiển thị thông tin tác giả, ngày xuất bản định dạng theo locale (`vi` hoặc `en`), thời gian đọc ước tính (`reading_time`), và số lượt xem (`view_count`).
     - Gọi song song 2 bài viết mới nhất và bài viết cùng chuyên mục để hiển thị Sidebar liên quan.
  3. **Cơ chế Tính Toán Lượt Xem (View Counting)**:
     - Request `getArticleDetail` thiết lập cờ `forwardCookies: true`. Next.js Server chuyển tiếp Cookie của Client đến Backend FastAPI.
     - Backend FastAPI nhận request, kiểm tra IP/cookie phiên để ghi nhận tăng view hợp lệ, chống spam F5.
  4. **SEO SSR Metadata Động & Schema.org**:
     - Hàm `generateMetadata()` trích xuất `seo_title`, `seo_description`, ảnh đại diện `og_image_url`, tác giả, thời gian xuất bản từ Backend để tạo thẻ Meta OpenGraph & Twitter Card.
     - Tự động sinh thẻ JSON-LD cấu trúc Schema.org chuẩn Google: `Article` và `BreadcrumbList`.

---

### 4.4. Chương Trình Đào Tạo & Đăng Ký Tư Vấn Tuyển Sinh
- **File Service**:
  - Chương trình: [`src/features/program/services/programService.ts`](../src/features/program/services/programService.ts)
  - Tư vấn: [`src/features/consultation/services/consultationService.ts`](../src/features/consultation/services/consultationService.ts)
- **Backend API**:
  - `GET /api/v1/portal/programs`: Danh sách chương trình đào tạo theo bậc học (`degree_level=bachelor|master|doctorate`).
  - `GET /api/v1/portal/programs/{slug}`: Chi tiết chương trình đào tạo, mục tiêu, chuẩn đầu ra, học phí.
  - `POST /api/v1/portal/consultations`: Tiếp nhận hồ sơ đăng ký tư vấn tuyển sinh từ thí sinh.
- **FE Đang Làm Gì**:
  1. Hiển thị danh sách ngành đào tạo Đại học / Sau đại học dạng thẻ chuyên nghiệp kèm mã ngành, số tín chỉ, thời gian đào tạo.
  2. Form Đăng ký tư vấn tuyển sinh:
     - Xây dựng bằng `react-hook-form` kết hợp `zod` schema để validate số điện thoại, email, họ tên trực tiếp ở Client.
     - Khi submit, Client gọi `consultationService.create()` qua `axiosClient.post` gửi dữ liệu lên Backend.
     - Xử lý trạng thái Loading spinner, thông báo thành công (Toast/Alert) và tự động làm mới form.

---

### 4.5. Cơ Cấu Tổ Chức Đơn Vị & Hồ Sơ Cán Bộ Giảng Viên
- **File Service**:
  - Tổ chức/Bộ môn: [`src/features/department/services/departmentService.ts`](../src/features/department/services/departmentService.ts)
  - Cán bộ/Giảng viên: [`src/features/lecturer/services/lecturerService.ts`](../src/features/lecturer/services/lecturerService.ts)
- **Backend API**:
  - `GET /api/v1/portal/departments`: Danh sách toàn bộ các bộ môn và phòng ban.
  - `GET /api/v1/portal/departments/{slug}/overview`: Thông tin tổng quan bộ môn, ban chủ nhiệm, thông tin liên hệ.
  - `GET /api/v1/portal/staffs?department_slug={slug}`: Danh sách giảng viên trực thuộc bộ môn hoặc Ban lãnh đạo trường.
  - `GET /api/v1/portal/staffs/{slug}`: Chi tiết hồ sơ khoa học của một cán bộ giảng viên.
- **FE Đang Làm Gì**:
  1. Hiển thị trang Cơ cấu tổ chức khoa, viện và từng bộ môn chuyên ngành (`bo-mon/[slug]`).
  2. Hiển thị hồ sơ cán bộ (`nhan-su/[slug]`): Học hàm (GS/PGS), học vị (TS/ThS), chức vụ, lý lịch khoa học, hướng nghiên cứu chính, các bài báo và công trình nghiên cứu công bố quốc tế.

---

### 4.6. Cơ Chế Đa Ngôn Ngữ Đồng Bộ (Next-Intl ⟷ Backend i18n)
- **Định tuyến i18n**: Cấu hình tại [`src/i18n/routing.ts`](../src/i18n/routing.ts) hỗ trợ 2 ngôn ngữ: `vi` (mặc định) và `en`.
- **Proxy Middleware**: [`src/proxy.ts`](../src/proxy.ts) tự động phân luồng URL dạng `/:locale/...` (ví dụ: `/vi/gioi-thieu`, `/en/about`).
- **Đồng Bộ Hai Chiều Với Backend FastAPI**:
  1. **Ở Server Component**: `httpClient` dùng `getLanguageHeader()` đọc locale từ Next.js request context và tự động inject 2 thông tin:
     - HTTP Header: `Accept-Language: vi` hoặc `Accept-Language: en`.
     - Query Parameter: `?lang=vi` hoặc `?lang=en`.
  2. **Ở Client Component**: `axiosClient` interceptor đọc locale từ URL pathname hoặc Cookie và gắn vào mọi request outgoing.
  3. **Xử lý dữ liệu đa ngữ trả về**: Helper [`getLocalizedField(obj, fieldName, locale)`](../src/features/article/utils/map-article.ts) tự động trích xuất chuỗi theo ngôn ngữ tương ứng, tự động fallback về tiếng Việt nếu chưa có bản dịch tiếng Anh, tránh lỗi hiển thị rỗng.

---

### 4.7. Web Push Notifications (VAPID) & Thống Kê Truy Cập (Visitor Counter)
- **Web Push Notifications**:
  - File quản lý: [`src/features/notification/components/PushNotificationManager.tsx`](../src/features/notification/components/PushNotificationManager.tsx)
  - Service Worker: [`public/sw.js`](../public/sw.js)
  - Luồng hoạt động:
    1. Khi người dùng vào trang web, FE tự động đăng ký Service Worker `/sw.js`.
    2. Sau 3 giây (nếu chưa từng từ chối), hiển thị banner xin quyền nhận thông báo tin tức mới.
    3. Khi người dùng đồng ý (`Notification.requestPermission() === "granted"`):
       - FE gọi `GET /api/v1/portal/notifications/vapid-public-key` lấy khóa công khai VAPID của máy chủ.
       - Trình duyệt tạo subscription qua `registration.pushManager.subscribe()`.
       - FE gửi payload chứa `{ endpoint, keys: { p256dh, auth }, user_agent }` tới `POST /api/v1/portal/notifications/subscribe`.
    4. Khi có bài viết quan trọng mới, Backend bắn thông báo đẩy; Service Worker ngầm hiển thị push popup trên màn hình máy tính/điện thoại ngay cả khi tab đã đóng.
- **Thống Kê Truy Cập (Visitor Counter)**:
  - File component: [`src/shared/components/layout/footer/visitor-statistics.tsx`](../src/shared/components/layout/footer/visitor-statistics.tsx)
  - Backend API: `GET /api/v1/portal/statistics`
  - FE lấy dữ liệu `{ online_count, total_visits }` và hiển thị trực quan ở chân trang Footer. Chỉ gọi 1 lần khi load trang để tối ưu và tránh lỗi rate limit 429.

---

## 5. Đóng Gói & Triển Khai Với Docker

Dự án có sẵn [`Dockerfile`](../Dockerfile) tối ưu chuẩn hóa Multi-Stage Build:

```dockerfile
# Stage 1: Base image
FROM node:22-alpine AS base

# Stage 2: Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm i --frozen-lockfile

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
RUN pnpm run build

# Stage 4: Production Runner (Dung lượng siêu nhẹ ~150MB)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### Các Lệnh Build & Chạy Docker
```bash
# 1. Build Docker image
docker build \
  --build-arg NEXT_PUBLIC_API_URL="http://localhost:8000" \
  --build-arg NEXT_PUBLIC_SITE_URL="http://localhost:3000" \
  -t ktcn-client-frontend:latest .

# 2. Khởi chạy Container
docker run -d -p 3000:3000 \
  --name ktcn-frontend \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e NEXT_PUBLIC_SITE_URL="http://localhost:3000" \
  ktcn-client-frontend:latest
```

---

## 6. Bảng Tra Cứu Sự Cố Thường Gặp (Troubleshooting)

| Hiện tượng lỗi | Nguyên nhân gốc rễ | Cách xử lý |
| :--- | :--- | :--- |
| **Giao diện hiện màn hình "Hệ thống đang bảo trì"** | Máy chủ FastAPI chưa được bật hoặc địa chỉ `NEXT_PUBLIC_API_URL` không đúng. | 1. Kiểm tra Backend FastAPI đang chạy tại `http://localhost:8000`.<br>2. Kiểm tra log của backend.<br>3. Kiểm tra file `.env` đã trỏ đúng cổng của Backend. |
| **Lỗi CORS khi submit tư vấn tuyển sinh** | Backend FastAPI chưa cấu hình `origins` cho phép tên miền `http://localhost:3000`. | Cập nhật biến `CORS_ORIGINS` trong file cấu hình của Backend API để cấp phép cho frontend. |
| **Hình ảnh bị lỗi không hiển thị (Broken Image)** | Ảnh upload từ MinIO S3 (`localhost:9000`) bị chặn bởi Next.js Image Optimization. | File [`next.config.ts`](../next.config.ts) đã bật `unoptimized: true` và `remotePatterns` cho cổng `9000`. Đảm bảo dịch vụ MinIO đang chạy. |
| **Lỗi Hydration Mismatch** | Thuộc tính DOM render ở Server khác với Client do múi giờ hoặc định dạng ngày tháng. | Dùng hàm [`formatDate()`](../src/features/article/utils/map-article.ts) chuẩn hóa theo locale cố định, tránh dùng `new Date().toLocaleDateString()` trực tiếp ở JSX. |
| **Nhấn đổi ngôn ngữ bị lỗi 404** | Route chưa được đăng ký trong danh sách locales hoặc chưa bọc trong `[locale]`. | Sử dụng component điều hướng [`Link`](../src/i18n/routing.ts) xuất phát từ `@/i18n/routing` thay vì `next/link` mặc định. |

---
*Tài liệu được cập nhật tự động & đồng bộ cho phiên bản **KTCN Portal Frontend 2026**.*
