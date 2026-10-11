# 📰 Quản Lý Tin Tức, Bài Viết, Lượt Xem & SEO Động
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Nghiệp vụ: **Article CMS & SEO Engine** | Mã nguồn: [`src/features/article`](../../src/features/article)

Tài liệu này mô tả chi tiết cách thức Frontend tương tác với Backend FastAPI để hiển thị danh sách bài viết phân trang, bộ lọc danh mục/tag, trang chi tiết bài viết, cơ chế tự động ghi nhận lượt xem, và quy trình sinh thẻ SEO Metadata cùng cấu trúc Schema.org chuẩn Google.

---

## 1. Điểm Cuối API (Backend Endpoints)

| Phương thức | Đường dẫn API | Tham số chính | Mục đích |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/portal/articles` | `page`, `page_size`, `search`, `category_slug`, `tag_slug`, `sort_by`, `sort_dir`, `category_slugs`, `exclude_category_slugs` | Lấy danh sách tin tức có phân trang và bộ lọc linh hoạt |
| `GET` | `/api/v1/portal/articles/{slug}` | `slug` (ví dụ: `khai-giang-2026`) | Lấy chi tiết bài viết đầy đủ nội dung HTML |
| `GET` | `/api/v1/portal/categories/{slug}/articles` | `page`, `page_size` | Lấy danh sách bài viết thuộc chuyên mục cụ thể |
| `GET` | `/api/v1/portal/tags` | `page`, `page_size`, `only_has_articles` | Lấy danh sách các thẻ hashtag phổ biến |

---

## 2. Mã Nguồn Gọi API Phía Frontend

Tệp mã nguồn: [`src/features/article/services/articleService.ts`](../../src/features/article/services/articleService.ts)

```typescript
export const articleService = {
  // 1. Lấy danh sách bài viết có phân trang và tìm kiếm (Cache 5 phút)
  async getLatestArticles(params: GetLatestArticlesParams = {}): Promise<PortalArticleListPaginationResponse | null> {
    return httpClient.get<PortalArticleListPaginationResponse>("/api/v1/portal/articles", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        category_slug: params.categorySlug,
        tag_slug: params.tagSlug,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        category_slugs: Array.isArray(params.categorySlugs) ? params.categorySlugs.join(",") : params.categorySlugs,
        exclude_category_slugs: Array.isArray(params.excludeCategorySlugs) ? params.excludeCategorySlugs.join(",") : params.excludeCategorySlugs,
      },
      revalidate: 300,
    });
  },

  // 2. Lấy chi tiết bài viết theo slug (Cache 10 phút, Chuyển tiếp Cookie phiên)
  async getArticleDetail(slug: string): Promise<PortalArticleDetail | null> {
    return httpClient.get<PortalArticleDetail>(`/api/v1/portal/articles/${slug}`, {
      revalidate: 600,
      forwardCookies: true, // Chuyển tiếp cookie để Backend ghi nhận tăng view hợp lệ
    });
  },

  // 3. Lấy bài viết theo danh mục (Cache 10 phút)
  async getArticlesByCategory(categorySlug: string, page = 1, pageSize = 10) {
    return httpClient.get<PortalArticlePaginationResponse>(`/api/v1/portal/categories/${categorySlug}/articles`, {
      params: { page, page_size: pageSize },
      revalidate: 600,
    });
  },
};
```

---

## 3. Luồng Chi Tiết Tại Trang Bài Viết (`tin-tuc/[slug]/page.tsx`)

### 3.1. Sinh SEO SSR Metadata Động (`generateMetadata`)
Trước khi render HTML, Next.js Server thực thi hàm `generateMetadata`:
```typescript
export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = await articleService.getArticleDetail(slug);

  if (!article) return { title: "Bài viết không tồn tại" };

  const title = getLocalizedField<string>(article, "title", locale);
  const excerpt = getLocalizedField<string>(article, "excerpt", locale);
  const seoTitle = getLocalizedField<string>(article, "seo_title", locale) || title;
  const seoDescription = getLocalizedField<string>(article, "seo_description", locale) || excerpt;

  return constructMetadata({
    title: seoTitle,
    description: seoDescription,
    locale,
    slug: slug,
    image: article.cover_url || article.thumbnail_url || article.og_image_url,
    type: "article",
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
    authors: [article.author.full_name || article.author.username],
  });
}
```
Kết quả: Các thẻ `<title>`, `<meta name="description">`, `<meta property="og:image">`, `<meta name="twitter:card">` được điền chính xác theo bài viết trong mã nguồn HTML gửi về trình duyệt.

---

### 3.2. Tự Động Phân Tích Mục Lục (Table of Contents)
Nội dung HTML trả về từ CMS (`article.content`) được đưa qua hàm helper [`parseHeadings()`](../../src/features/article/utils/parse-headings.ts):
- Tự động trích xuất tất cả các thẻ `<h2>` và `<h3>`.
- Gắn thuộc tính `id` chuẩn URL slug vào các tiêu đề trong bài viết.
- Dựng thành danh sách liên kết neo (Anchor Links) hiển thị ở cột phụ bên trái trên màn hình Desktop rộng (`min-[1600px]`), giúp người đọc nhanh chóng chuyển đến các phần mong muốn.

---

### 3.3. Cơ Chế Ghi Nhận Lượt Xem (View Counting)
Để tránh hiện tượng người dùng refresh trang liên tục làm tăng đột biến lượt xem ảo:
1. Khi Server Component gọi `articleService.getArticleDetail(slug)`, cờ `forwardCookies: true` đọc cookie `cookieStore` từ trình duyệt và gửi kèm sang Backend FastAPI.
2. Backend FastAPI kiểm tra session ID / địa chỉ IP của client:
   - Nếu trong một khoảng thời gian quy định (ví dụ 30 phút) client này đã xem bài viết, Backend giữ nguyên số lượt xem.
   - Nếu là lượt xem mới hợp lệ, Backend tăng `view_count = view_count + 1`.
3. Số lượt xem được hiển thị công khai trên giao diện kèm biểu tượng con mắt `Eye` bên cạnh ngày đăng và thời gian đọc (`reading_time`).

---

### 3.4. Cấu Trúc Dữ Liệu Schema.org (JSON-LD)
Trang chi tiết bài viết tự động chèn hai khối Schema có cấu trúc dạng JSON-LD vào thẻ `<head>`:
1. **Article Schema**: Định danh đây là bài báo/tin tức học thuật chính thức, chứa thông tin ngày xuất bản (`datePublished`), ngày sửa đổi gần nhất (`dateModified`), tác giả (`author`), tổ chức xuất bản (`publisher`: Trường Kỹ thuật và Công nghệ - Đại học Vinh).
2. **BreadcrumbList Schema**: Cung cấp đường dẫn phân cấp điều hướng cho Google (Trang chủ > Chuyên mục > Bài viết).
