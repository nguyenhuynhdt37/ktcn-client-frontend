# 📚 Trung Tâm Tài Liệu - KTCN Frontend Portal (`ktcn-client-frontend`)
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Phiên bản tài liệu: **2.0.0 (Production Ready)** | Công nghệ: **Next.js 16.2.9**, **React 19.2.4**, **Tailwind CSS v4**

Chào mừng bạn đến với trung tâm tài liệu kỹ thuật chính thức của dự án **KTCN Client Frontend**. Bộ tài liệu này được biên soạn đầy đủ, chi tiết từ hướng dẫn cài đặt môi trường, cấu hình biến hệ thống, kiến trúc giao tiếp với Backend FastAPI cho đến từng luồng nghiệp vụ cụ thể.

---

## 🗺️ Bản Đồ Cấu Trúc Tài Liệu

### 1. ⚡ Cẩm Nang Khởi Động Nhanh (Quick Start & Boost)
- **Cẩm nang tóm lược toàn diện:** [`md/boost.md`](../md/boost.md) hoặc [`docs/boost.md`](boost.md)  
  *(Tóm tắt nhanh mọi lệnh chạy, biến môi trường, luồng giao tiếp FE-BE và bảng tra cứu lỗi).*
- **Hướng dẫn cài đặt chi tiết từ số 0:** [`docs/getting-started/01-cai-dat-va-khoi-chay.md`](getting-started/01-cai-dat-va-khoi-chay.md)  
  *(Yêu cầu Node 22/pnpm, cấu hình `.env`, chạy dev, build production, kiểm thử ESLint/Prettier, và đóng gói Docker container).*

---

### 2. 🏛️ Kiến Trúc Hệ Thống & Cơ Chế Tương Tác Backend
- **Kiến trúc Next.js 16 RSC & Cơ chế tương tác với FastAPI:** [`docs/architecture/01-kien-truc-fe-va-tuong-tac-be.md`](architecture/01-kien-truc-fe-va-tuong-tac-be.md)  
  - Luồng dữ liệu: Trình duyệt ⟷ Next.js Server (RSC/BFF) ⟷ FastAPI Backend.
  - Phân tách 2 bộ API client: `httpClient` (Server Components) vs `axiosClient` (Client Components).
  - Chiến lược Caching & Tái tạo dữ liệu (ISR / Revalidation / Cache Tags).
  - Phòng vệ hệ thống: Cơ chế Circuit Breaker UI và Chế độ bảo trì tự phục hồi (`Maintenance Mode`).

---

### 3. 🔍 Mô Tả Chi Tiết FE Đang Làm Gì Với Backend Theo Từng Tính Năng
- 🧭 **[01. Menu Điều Hướng & Cây Liên Kết Đa Cấp](features/01-menu-va-navigation.md)**: Gọi API lấy cây menu header/footer, thuật toán khớp slug thông minh (`resolveMenuTreeSlugs`), render Mega Menu desktop và Drawer accordion mobile, cơ chế cache tag.
- 🖼️ **[02. Banners & Slider Hero Trang Chủ](features/02-banner-va-hero.md)**: Lấy danh sách banner trang chủ, vận hành thanh trượt Embla Carousel, tối ưu hóa hình ảnh Core Web Vitals (LCP) với `next/image priority`.
- 📰 **[03. Quản Lý Tin Tức, Bài Viết, Lượt Xem & SEO Động](features/03-tin-tuc-va-bai-viet.md)**: Danh sách tin tức phân trang/tìm kiếm/lọc danh mục, chi tiết bài viết, tự động bóc tách mục lục (Table of Contents), cơ chế forward cookie đếm lượt xem chống spam, sinh SEO SSR Metadata và JSON-LD Schema.org.
- 🎓 **[04. Chương Trình Đào Tạo & Đăng Ký Tư Vấn Tuyển Sinh](features/04-dao-tao-va-tuyen-sinh.md)**: Lấy danh sách CTĐT đại học & sau đại học, biểu mẫu đăng ký tư vấn trực tuyến, validate Zod schema phía client, xử lý gửi AJAX qua Axios.
- 🏛️ **[05. Cơ Cấu Tổ Chức Đơn Vị & Hồ Sơ Cán Bộ Giảng Viên](features/05-to-chuc-va-can-bo.md)**: Sơ đồ tổ chức khoa/bộ môn, trang giới thiệu đơn vị, danh sách và hồ sơ khoa học cá nhân của từng cán bộ giảng viên.
- 🌐 **[06. Đa Ngôn Ngữ (i18n) & Cơ Chế Đồng Bộ Với Backend](features/06-da-ngon-ngu-i18n.md)**: Cấu hình `next-intl`, định tuyến tiền tố `/[locale]/...`, Proxy middleware rewrite/redirect, tự động đính kèm `Accept-Language` và query param `lang` trong mọi request, helper bóc tách trường đa ngữ `getLocalizedField()`.
- 🔔 **[07. Web Push Notification (VAPID) & Thống Kê Truy Cập](features/07-web-push-va-analytics.md)**: Đăng ký Service Worker `/sw.js`, trao đổi khóa công khai VAPID với Backend, nhận thông báo đẩy tức thời, và khối thống kê số người trực tuyến/tổng lượt xem (Visitor Counter) ở Footer.

---

### 4. 📑 Tài Liệu Kỹ Thuật Tích Hợp Bổ Sung
- [Hướng dẫn tích hợp thông báo thời gian thực SSE & Cảnh báo rời trang](fe-integration-guide.md)
- [Chi tiết tích hợp API Header Menu](header-menu-api-integration.md)
- [Chi tiết tích hợp Cây danh mục (Category Tree)](category-tree-integration.md)
- [Chi tiết tích hợp Danh sách tin mới nhất](latest-articles-api-integration.md)
- [Chi tiết tích hợp Tin tức theo chuyên mục](articles-by-category-integration.md)
- [Phân tích & Tích hợp bộ lọc SEO nâng cao](advanced-seo-filter-analysis.md)
- [Chi tiết tích hợp Banner quảng cáo](banner-api-integration.md)
- [Chi tiết tích hợp SEO trang bài viết](seo-article-detail-integration.md)
- [Quy trình triển khai máy chủ (Deployment Guide)](deployment.md)

---
*Tài liệu được phát triển và duy trì bởi Đội ngũ Kỹ thuật Cổng thông tin — **Trường Kỹ Thuật và Công Nghệ, Đại Học Vinh**.*
