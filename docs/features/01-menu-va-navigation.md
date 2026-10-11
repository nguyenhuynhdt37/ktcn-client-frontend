# 🧭 Menu Điều Hướng & Cây Liên Kết Đa Cấp (Header & Footer)
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Nghiệp vụ: **Navigation System** | Mã nguồn: [`src/features/menu`](../../src/features/menu)

Tài liệu này mô tả chi tiết cách Frontend tương tác với Backend FastAPI để lấy dữ liệu cây menu phân cấp, giải quyết đường dẫn slug thông minh, và dựng giao diện Mega Menu trên máy tính cũng như Drawer Accordion trên thiết bị di động.

---

## 1. Điểm Cuối API (Backend Endpoints)

| Phương thức | Đường dẫn API | Tham số | Mục đích |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/portal/menus/{code}/tree` | `code`: `header` hoặc `footer`<br>`revision`: `6` | Lấy toàn bộ cây menu đa cấp kèm danh sách liên kết con |

### Cấu Trúc Dữ Liệu Backend Trả Về (`MenuTreeResponse`)
```json
{
  "id": "menu-uuid-123",
  "code": "header",
  "name": "Header Navigation",
  "items": [
    {
      "id": "item-1",
      "title": "Giới thiệu",
      "target_type": "PAGE",
      "target_id": "page-uuid-1",
      "target_info": {
        "slug": "gioi-thieu",
        "title": "Giới thiệu chung"
      },
      "order_index": 1,
      "children": [
        {
          "id": "item-1-1",
          "title": "Cơ cấu tổ chức",
          "target_type": "PAGE",
          "target_id": "page-uuid-2",
          "target_info": {
            "slug": "co-cau-to-chuc",
            "title": "Cơ cấu tổ chức"
          },
          "order_index": 1,
          "children": []
        }
      ]
    }
  ]
}
```

---

## 2. Mã Nguồn Gọi API Phía Frontend

Tệp mã nguồn: [`src/features/menu/services/menuService.ts`](../../src/features/menu/services/menuService.ts)

```typescript
import { MenuTreeResponse } from "../types/menu.types";
import { httpClient } from "@/shared/api/httpClient";

export const menuService = {
  /**
   * Lấy cấu trúc cây menu đa ngôn ngữ từ API Portal
   */
  async getMenuTree(code: string): Promise<MenuTreeResponse | null> {
    return httpClient.get<MenuTreeResponse>(`/api/v1/portal/menus/${code}/tree`, {
      revalidate: 60, // Tái tạo bộ nhớ đệm mỗi 60 giây (ISR)
      tags: [`menu-${code}`], // Gắn thẻ để hỗ trợ On-Demand Revalidation
      params: { revision: 6 },
    });
  },
};
```

---

## 3. Cơ Chế Khớp Slug Thông Minh (`resolveMenuTreeSlugs`)

Trong thực tế, một số menu item do ban quản trị tạo có thể chưa có sẵn slug đường dẫn hoặc chỉ lưu `target_id`. Để người dùng không gặp lỗi liên kết hỏng (Broken Link), Frontend triển khai hàm đệ quy tại [`src/app/[locale]/layout.tsx`](../../src/app/[locale]/layout.tsx):

```typescript
function resolveMenuTreeSlugs(items: any[], articles: any[]) {
  for (const item of items) {
    if (item.target_type === "ARTICLE" || item.target_type === "PAGE") {
      if (!item.target_info?.slug) {
        // 1. Tìm kiếm trong danh sách bài viết đã tải từ trước
        const matchedArticle = articles.find((a) => a.id === item.target_id);
        if (matchedArticle) {
          item.target_info = {
            title: item.title || matchedArticle.title,
            slug: matchedArticle.slug
          };
          item.has_link = true;
        } else if (item.title) {
          // 2. Tự động chuyển đổi tiêu đề thành URL Slug chuẩn SEO (toSlug)
          item.target_info = {
            title: item.title,
            slug: toSlug(item.title)
          };
          item.has_link = true;
        }
      }
    }
    // Đệ quy cho toàn bộ nhánh con
    if (item.children && item.children.length > 0) {
      resolveMenuTreeSlugs(item.children, articles);
    }
  }
}
```

---

## 4. Xử Lý Các Loại Liên Kết Menu (`TargetType`)

Hàm [`resolveMenuUrl()`](../../src/features/menu/utils/resolve-menu-url.ts) phân tích thuộc tính `target_type` để sinh thẻ điều hướng phù hợp:

1. **`EXTERNAL_LINK`**: Liên kết đến trang ngoài (ví dụ: Cổng sinh viên, Thư viện số). Render thẻ `<a>` với `target="_blank"` và `rel="noopener noreferrer"`.
2. **`CATEGORY`**: Liên kết danh mục tin tức. Render đường dẫn `/[locale]/tin-tuc?category=[slug]`.
3. **`ARTICLE`**: Liên kết đến bài viết chi tiết. Render đường dẫn `/[locale]/tin-tuc/[slug]`.
4. **`PAGE`**: Trang tĩnh của trường (Giới thiệu, Đào tạo, Tuyển sinh). Render đường dẫn nội bộ tương ứng `/[locale]/[slug]`.
5. **Item không có link** (Chỉ đóng vai trò tiêu đề nhóm cha): Render thành khối mở rộng (Dropdown Hover / Accordion Toggle) không thể nhấn điều hướng.

---

## 5. Hiển Thị Giao Diện Người Dùng (UI Implementation)

- **Mega Menu Desktop ([`Header.tsx`](../../src/shared/components/layout/header.tsx))**:
  - Tự động tính toán số cột dựa trên số lượng phần tử con.
  - Hover hiển thị mượt mà với hiệu ứng chuyển tiếp CSS mờ dần (Fade-in).
  - Tích hợp phím `Escape` và tự động đóng menu khi nhấp chuột ra ngoài vùng hiển thị.
- **Mobile Drawer Menu**:
  - Dạng thanh trượt từ cạnh phải màn hình.
  - Mỗi mục có menu con sẽ có nút mũi tên mở/gập độc lập (Accordion) giúp người dùng điều hướng dễ dàng trên màn hình cảm ứng nhỏ.
