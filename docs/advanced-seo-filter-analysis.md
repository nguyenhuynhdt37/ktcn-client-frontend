# Phân Tích Kiến Trúc DB, API & Thiết Kế Trang Tin Tức Phân Trang Bộ Lọc Nâng Cao (Tối ưu SEO)

Tài liệu này mổ xẻ cấu trúc dữ liệu từ Backend và thiết kế giải pháp lập trình Front-End tối ưu nhất cho trang danh sách tin tức tổng hợp `/tin-tuc` hỗ trợ Tìm kiếm, Lọc danh mục/tag, Sắp xếp động, Phân trang số hóa và SEO nâng cao.

---

## 1. Mổ xẻ Cơ sở dữ liệu & API Backend

Qua phân tích mã nguồn Python Backend (`router.py` và `service.py`), hệ thống quản lý cơ sở dữ liệu bài viết (Articles) được liên kết chặt chẽ với Chuyên mục (Categories) và Thẻ (Tags).

### Sơ đồ liên kết dữ liệu (Entity Relationship)

```
[ARTICLE]
  - id (UUID, PK)
  - title (String)
  - slug (String, Unique)
  - excerpt (String)
  - content (Text)
  - view_count (Integer)
  - publish_at (DateTime)
  - status (String: PUBLISHED, DRAFT, etc.)
  - category_id (UUID, FK)
       |
       | 1-n
       v
[CATEGORY]
  - id (UUID, PK)
  - name (String)
  - slug (String, Unique)
  - parent_id (UUID, FK)

[ARTICLE] <=== n-m (ARTICLE_TAG_RELATION) ===> [TAG]
                                                 - id (UUID, PK)
                                                 - name (String)
                                                 - slug (String, Unique)
                                                 - color (String)
```

### Phân tích endpoint tích hợp: `GET /api/v1/articles/portal`
Đây là Public API cốt lõi được cấu hình tối ưu để gọi từ Server-side Component.

*   **Đặc điểm hoạt động:** Chỉ lấy các bài viết đã xuất bản (`PUBLISHED`), không bị xóa mềm (`deleted_at IS NULL`) và thời gian xuất bản hợp lệ (`publish_at <= NOW`).
*   **Các tham số lọc tối ưu đã cấu hình:**
    1.  `search` (string, optional): Tìm kiếm không phân biệt hoa thường theo `title`, `excerpt`, hoặc `content`.
    2.  `category_slug` (string, optional): Lọc theo danh mục chính xác từ slug.
    3.  `tag_slug` (string, optional): *Mới bổ sung* - Lọc chính xác các bài viết có gắn tag slug tương ứng thông qua quan hệ n-n (`Article.tags.any()`).
    4.  `sort_by` (string, default: `publish_at`): Hỗ trợ sắp xếp theo ngày xuất bản (`publish_at`), lượt xem (`view_count`), hoặc ngày tạo (`created_at`).
    5.  `sort_dir` (string, default: `desc`): Hướng sắp xếp tăng/giảm (`asc`/`desc`).
    6.  `page` & `page_size`: Quản lý phân trang.

---

## 2. Thiết Kế Luồng Dữ Liệu (Data Flow) Trên Next.js Server Components

Để đảm bảo hiệu năng tối đa và SEO hoàn hảo, trang `/tin-tuc/page.tsx` sẽ hoạt động dưới dạng **Server Component**.

1. **Người dùng / Google Bot** truy cập vào URL: `/tin-tuc?q=tuyen-sinh&page=2`
2. **Next.js App Router** trích xuất tham số `searchParams` trực tiếp ở server-side.
3. **Page Component** gọi song song 3 API requests (sử dụng `Promise.all` để tối ưu hóa thời gian phản hồi) đến Backend FastAPI:
   - `getLatestArticlesServer(...)`: Lấy danh sách bài viết đã lọc, sắp xếp và phân trang.
   - `listCategories()`: Lấy toàn bộ danh mục bài viết để hiển thị bộ lọc chuyên mục.
   - `listTags()`: Lấy danh sách tag phổ biến để vẽ cụm từ khóa (Tag Cloud).
4. **Server** render HTML tĩnh hoàn chỉnh (gồm đầy đủ Metadata động và dữ liệu JSON-LD cấu trúc) trả về cho Trình duyệt/Google Bot.

---

## 3. Thiết Kế Giao Diện Bộ Lọc & Phân Trang Phức Tạp (UX/UI)

Bố cục trang chia thành **2 cột chính**:
*   **Cột chính (Trái - 75%):** Thanh tìm kiếm, thanh thống kê kết quả lọc, lưới bài viết 3 cột hiện đại, và thanh phân trang số nâng cao.
*   **Sidebar (Phải - 25%):**
    *   **Widget Bộ lọc Danh mục:** Hiển thị danh sách hoặc cây phân cấp các danh mục bài viết hoạt động, hỗ trợ click chọn nhanh để lọc.
    *   **Widget Sắp xếp:** Dropdown chọn tiêu chí sắp xếp (Mới nhất, Xem nhiều nhất, Cũ nhất).
    *   **Widget Tag Cloud:** Các thẻ tag hiển thị dạng viên thuốc màu sắc. Khi nhấp vào tag sẽ kích hoạt lọc theo tag.

### Thuật toán Phân trang Số nâng cao (Advanced Numerical Pagination)
Thay vì chỉ hiển thị nút "Trước" và "Sau", thuật toán sẽ sinh ra danh sách trang thông minh:
*   Nếu tổng số trang <= 5: Hiển thị đầy đủ `[1] [2] [3] [4] [5]`.
*   Nếu tổng số trang > 5:
    *   Đang ở trang đầu: `[1] [2] [3] ... [12]`.
    *   Đang ở trang giữa: `[1] ... [4] [5] [6] ... [12]`.
    *   Đang ở trang cuối: `[1] ... [10] [11] [12]`.

Mọi hành động click chuyển trang đều là các thẻ `<Link>` chuẩn SEO, cập nhật lại `searchParams` trên URL để duy trì trạng thái của các bộ lọc khác.

---

## 4. Giải Pháp Tối Ưu Hóa SEO Tuyệt Đối

Đây là phần quan trọng nhất giúp trang web đạt thứ hạng cao trên các công cụ tìm kiếm:

### A. Siêu dữ liệu SEO Động (Dynamic Metadata API)
Sử dụng hàm `generateMetadata` của Next.js để sinh thẻ meta theo ngữ cảnh thực tế của bộ lọc:
*   **Tiêu đề trang (`<title>`)**:
    *   Mặc định: `Tin tức & Sự kiện nổi bật | Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh`
    *   Khi tìm kiếm: `Tìm kiếm bài viết: "[Từ khóa]" (Trang [X]/[Tổng]) | SET VinhUni`
    *   Khi lọc Danh mục: `Danh mục: [Tên chuyên mục] (Trang [X]) | SET VinhUni`
    *   Khi lọc Tag: `Bài viết về #[Tên thẻ] (Trang [X]) | SET VinhUni`
*   **Mô tả trang (`<meta name="description">`)**: Cung cấp nội dung tóm tắt tương ứng, ví dụ: `"Tổng hợp các bài viết gắn thẻ #[Tag] của Trường Kỹ thuật và Công nghệ Trường Đại học Vinh..."`

### B. Ngăn ngừa trùng lặp nội dung (Canonical URL)
Khi lọc hoặc sắp xếp, URL sẽ sinh ra rất nhiều tham số phụ (ví dụ: `?sort=view_count`, `?dir=desc`). Công cụ tìm kiếm của Google có thể coi đây là các trang riêng biệt nhưng trùng nội dung (Duplicate Content) và phạt trang web.
*   **Giải pháp:** Sinh liên kết chuẩn gốc `<link rel="canonical" href="..." />`.
*   Nếu đang lọc chuyên mục `/tin-tuc?category=tuyen-sinh`, đường dẫn canonical chuẩn hóa sẽ là: `https://set.vinhuni.edu.vn/tin-tuc?category=tuyen-sinh` (loại bỏ các filter sắp xếp không cần thiết).

### C. Cấu hình Robots thông minh (robots meta tag)
*   **Trang kết quả Tìm kiếm (`?q=...`)**: Google khuyến cáo **không nên index** các trang kết quả tìm kiếm nội bộ để tránh làm loãng tài nguyên thu thập dữ liệu (crawl budget).
    *   *Thiết lập:* `robots: { index: false, follow: true }` (Không lập chỉ mục, nhưng vẫn cho phép robot đi theo các liên kết bài viết).
*   **Trang lọc danh mục & lọc tag chính thức**: Đây là các trang chứa từ khóa cốt lõi vô cùng giá trị cho SEO.
    *   *Thiết lập:* `robots: { index: true, follow: true }` (Yêu cầu Google index tối đa).

### D. JSON-LD Cấu trúc dữ liệu danh sách (ItemList Schema)
Chèn một script JSON-LD định dạng `ItemList` của Schema.org để khai báo danh sách bài viết hiện tại. Google Bot sẽ đọc cấu trúc này để hiển thị các bài viết dạng băng chuyền (Carousel) trực tiếp trên kết quả tìm kiếm Google Search.
