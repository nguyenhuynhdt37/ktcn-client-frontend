# 🖼️ Banners & Slider Hero Trang Chủ
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Nghiệp vụ: **Banner & Hero Media** | Mã nguồn: [`src/features/banner`](../../src/features/banner)

Tài liệu này mô tả chi tiết cách Frontend kết nối với Backend FastAPI để lấy danh sách ảnh biểu ngữ quảng bá (Banner/Slider), tối ưu hóa hiệu năng hiển thị hình ảnh (Core Web Vitals - LCP) và vận hành thanh trượt đa năng (Embla Carousel).

---

## 1. Điểm Cuối API (Backend Endpoints)

| Phương thức | Đường dẫn API | Tham số truy vấn | Mục đích |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/portal/banners` | `position`: `HOME_HERO` \| `SIDEBAR` \| `POPUP` | Lấy danh sách banner đang kích hoạt theo vị trí hiển thị |

### Cấu Trúc Dữ Liệu Backend Trả Về (`BannerResponse[]`)
```json
[
  {
    "id": "banner-uuid-01",
    "title": "Tuyển sinh Đại học Chính quy 2026",
    "subtitle": "Trường Kỹ thuật và Công nghệ - Đại học Vinh",
    "image_url": "http://localhost:9000/media/banners/hero-ts-2026.webp",
    "mobile_image_url": "http://localhost:9000/media/banners/hero-ts-2026-mobile.webp",
    "link_url": "/vi/tu-van-tuyen-sinh",
    "target_blank": false,
    "position": "HOME_HERO",
    "order_index": 1,
    "is_active": true
  }
]
```

---

## 2. Mã Nguồn Gọi API Phía Frontend

Tệp mã nguồn: [`src/features/banner/services/bannerService.ts`](../../src/features/banner/services/bannerService.ts)

```typescript
import { BannerResponse, BannerPosition } from "../types/banner.types";
import { httpClient } from "@/shared/api/httpClient";

export const bannerService = {
  /**
   * Lấy danh sách banner theo vị trí hiển thị
   */
  async getBanners(position: BannerPosition): Promise<BannerResponse[]> {
    const data = await httpClient.get<BannerResponse[]>("/api/v1/portal/banners", {
      params: {
        position,
      },
      revalidate: 1800, // Lưu bộ nhớ đệm 30 phút trên Server Cache
    });
    return data || [];
  },
};
```

---

## 3. Luồng Hoạt Động & Tối Ưu Hiển Thị Giao Diện

### 3.1. Fetch Dữ Liệu Song Song Tại Trang Chủ
Tại trang chủ [`src/app/[locale]/(public)/page.tsx`](../../src/app/[locale]/(public)/page.tsx), lời gọi `bannerService.getBanners(BannerPosition.HOME_HERO)` được chạy trong khối `Promise.all` cùng với các API tin tức khác. Việc này giúp Next.js Server hoàn tất truy vấn trong thời gian ngắn nhất trước khi render HTML.

### 3.2. Widget Slider Embla Carousel ([`HomeHeroWidget.tsx`](../../src/features/banner/components/HomeHeroWidget.tsx))
- **Thư viện sử dụng**: `embla-carousel-react` kết hợp plugin tự động trượt (Autoplay sau mỗi 5 giây).
- **Điều khiển thân thiện**:
  - Hỗ trợ thao tác vuốt cảm ứng nhạy trên Smartphone và kéo chuột trên Desktop.
  - Tạm dừng trượt khi người dùng di chuột lên banner (Pause on Hover).
  - Nút mũi tên chuyển slide và thanh chấm tròn (Pagination Dots) biểu thị vị trí hiện tại.

### 3.3. Tối Ưu Hóa Hình Ảnh Core Web Vitals (LCP)
- Sử dụng component `Image` của Next.js với thuộc tính:
  - Slide đầu tiên: Được gán cờ `priority={true}` để trình duyệt ưu tiên tải ảnh ngay lập tức, ngăn ngừa hiện tượng giật cục và đạt điểm xanh LCP (Largest Contentful Paint) trên Google PageSpeed.
  - Các slide tiếp theo: Được tải theo cơ chế trễ (Lazy Loading).
  - Cung cấp thuộc tính `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"` để tải kích thước ảnh vừa vặn với độ phân giải màn hình.

---

## 4. Xử Lý Đa Ngôn Ngữ & Điều Hướng

- **Tiêu đề & Phụ đề**: Tự động chuyển đổi hiển thị theo ngôn ngữ của trang (`locale === 'en' ? item.title_en : item.title_vi`).
- **Liên kết**: Nếu trường `link_url` tồn tại, component sẽ tự động bọc khối banner bằng thẻ `Link` (nếu là link nội bộ) hoặc thẻ `<a>` với `rel="noopener noreferrer"` (nếu là link ra trang ngoài).
