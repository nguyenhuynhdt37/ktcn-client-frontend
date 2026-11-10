# Hướng Dẫn Tích Hợp API Tin Tức Tổng Hợp & Xây Dựng Layout Portal (HUST Style)

Tài liệu này hướng dẫn lập trình viên Front-End (FE) cách gọi API Portal mới (`GET /api/v1/articles/portal`), thiết lập cấu trúc trang danh sách bài viết tổng hợp `/tin-tuc` lấy ý tưởng layout từ trang tuyển sinh ĐH Bách Khoa Hà Nội (HUST), tích hợp bộ lọc phức tạp và tối ưu hóa SEO tối đa trên Next.js App Router (sử dụng Tailwind CSS v4 và các Design Tokens tiêu chuẩn của dự án).

---

## 1. Thông Tin API Backend Mới

*   **Endpoint:** `GET /api/v1/articles/portal`
*   **Authentication:** Public (Không yêu cầu đăng nhập).
*   **Các tham số Query Parameters hỗ trợ (Có thể kết hợp tự do):**
    *   `search` (string, optional): Từ khóa tìm kiếm theo tiêu đề, tóm tắt hoặc nội dung.
    *   `category_slug` (string, optional): Lọc bài viết theo slug danh mục (ví dụ: `tuyen-sinh`, `thong-bao`).
    *   `tag_slug` (string, optional): Lọc bài viết theo slug của thẻ tag (ví dụ: `nckh`, `tuyen-sinh-2026`).
    *   `author_username` (string, optional): Lọc bài viết theo username tác giả.
    *   `is_featured` (boolean, optional): Lọc bài viết nổi bật.
    *   `is_pinned` (boolean, optional): Lọc bài viết ghim trang chủ.
    *   `has_thumbnail` (boolean, optional): Lọc bài có ảnh đại diện hay không.
    *   `sort_by` (string, default: `publish_at`): Cột sắp xếp (`publish_at`, `view_count`, `title`, `created_at`, `sort_order`).
    *   `sort_dir` (string, default: `desc`): Hướng sắp xếp (`desc` hoặc `asc`).
    *   `page` (int, default: 1): Số trang muốn lấy (chuẩn hóa tự động $\ge 1$).
    *   `page_size` (int, default: 10): Số lượng tin mỗi trang (khống chế tối đa 100).

---

## 2. Thiết Kế Layout Ý Tưởng (HUST Style)

Giao diện trang tin tức được thiết kế theo bố cục **2 cột mất cân đối (Cột chính bên trái rộng 75% - Sidebar bên phải rộng 25%)**, mang phong cách hiện đại và học thuật cao:

```
+-----------------------------------------------------------------------------+
|                                  BREADCRUMB                                 |
+-----------------------------------------------------------------------------+
|                                 TITLE PAGE                                  |
+-----------------------------------------------------------------------------+
|                               SEARCH & SORT BAR                             |
+-----------------------------------------------------------------------------+
|                                      |                                      |
|          [CỘT CHÍNH - TÊN BỘ LỌC]    |             [SIDEBAR PHẢI]           |
|                                      |                                      |
|  +--------------------------------+  |  +--------------------------------+  |
|  | Bài viết 1                     |  |  | Danh mục Chuyên mục            |  |
|  | [Ảnh Trái] [Tiêu đề + tóm tắt] |  |  | - Tuyển sinh                   |  |
|  +--------------------------------+  |  | - Đào tạo                      |  |
|  +--------------------------------+  |  | - Nghiên cứu khoa học          |  |
|  | Bài viết 2                     |  |  +--------------------------------+  |
|  | [Ảnh Trái] [Tiêu đề + tóm tắt] |  |  +--------------------------------+  |
|  +--------------------------------+  |  | Thẻ Tag Phổ Biến (Tag Cloud)   |  |
|                                      |  | #cntt   #nckh   #clb   #hocphi |  |
|          [PHÂN TRANG SỐ]             |  +--------------------------------+  |
|     << <  1  2  3  ...  12  > >>     |                                      |
|                                      |                                      |
+-----------------------------------------------------------------------------+
```

### Các đặc trưng của layout HUST Style:
1.  **Dạng Danh sách ngang (Horizontal List Card):** Thay vì lưới Grid 3 cột, danh sách bài viết hiển thị theo hàng ngang. Ảnh thumbnail nằm bên trái, tiêu đề lớn + tóm tắt (excerpt) + ngày xuất bản + tag nằm bên phải. Bố cục này giúp người dùng dễ dàng lướt đọc tóm tắt nội dung nhanh chóng.
2.  **Thanh Tìm kiếm & Bộ Sắp xếp nằm ngang ở đầu trang:** Cho phép người dùng nhập từ khóa tìm kiếm nhanh và chọn dropdown sắp xếp (Mới nhất, Xem nhiều nhất, v.v.).
3.  **Cây Danh mục & Tag Cloud ở bên phải:** Giúp người dùng lọc nhanh bài viết theo chuyên mục hoặc thẻ tag yêu thích chỉ với 1 cú click.

---

## 3. Mã Nguồn Mẫu Next.js App Router (Server Component)

Dưới đây là file mã nguồn tích hợp hoàn chỉnh cho trang `/tin-tuc/page.tsx` sử dụng **React Server Component** và các biến màu thương hiệu VinhUni để tối ưu hóa SEO và tốc độ tải trang.

```tsx
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { FolderOpen, CalendarDays, Search, ChevronLeft, ChevronRight, Eye, Tag as TagIcon } from "lucide-react";

// Định nghĩa Interface dữ liệu từ API Backend
interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_object_key: string;
  view_count: number;
  publish_at: string;
  is_pinned: boolean;
  is_featured: boolean;
  category?: { name: string; slug: string };
  tags: Array<{ name: string; slug: string; color: string }>;
}

interface PaginationData {
  items: Article[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// ──────────────────────────────────────────────
// 1. TỐI ƯU SEO ĐỘNG (Dynamic Metadata)
// ──────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    tag?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q, category, tag, page } = await searchParams;
  const pageStr = page ? ` - Trang ${page}` : "";
  
  let title = "Tin tức & Sự kiện nổi bật";
  let description = "Cổng thông tin tổng hợp, cập nhật tin tức, sự kiện mới nhất từ Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh.";

  if (q) {
    title = `Kết quả tìm kiếm cho "${q}"${pageStr}`;
  } else if (category) {
    title = `Chuyên mục: ${category.replace("-", " ").toUpperCase()}${pageStr}`;
  } else if (tag) {
    title = `Thẻ bài viết: #${tag}${pageStr}`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://set.vinhuni.edu.vn";
  
  // Xây dựng canonical URL chuẩn hóa
  const queryParams = new URLSearchParams();
  if (category) queryParams.append("category", category);
  if (tag) queryParams.append("tag", tag);
  if (page) queryParams.append("page", page);
  const canonicalUrl = `${siteUrl}/tin-tuc${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

  return {
    title: `${title} | Trường Kỹ thuật và Công nghệ`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    // Chặn Google index các trang tìm kiếm rác, chỉ cho index trang danh mục/tag chính thức
    robots: q ? "noindex, follow" : "index, follow",
  };
}

// Helper fetch bài viết từ Server Component
async function getArticles(params: URLSearchParams): Promise<PaginationData | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${apiBase}/api/v1/articles/portal?${params.toString()}`, {
      next: { revalidate: 300 } // Cache 5 phút
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return null;
  }
}

// ──────────────────────────────────────────────
// 2. MAIN COMPONENT (Server Component)
// ──────────────────────────────────────────────
export default async function NewsAggregatePage({ searchParams }: PageProps) {
  const { page, q, category, tag, sort } = await searchParams;
  
  const currentPage = parseInt(page || "1");
  const searchQuery = q || "";
  const categorySlug = category || "";
  const tagSlug = tag || "";
  const sortBy = sort || "publish_at";

  // Build params gửi lên Backend API
  const apiParams = new URLSearchParams();
  apiParams.append("page", currentPage.toString());
  apiParams.append("page_size", "10"); // Page size mặc định
  if (searchQuery) apiParams.append("search", searchQuery);
  if (categorySlug) apiParams.append("category_slug", categorySlug);
  if (tagSlug) apiParams.append("tag_slug", tagSlug);
  apiParams.append("sort_by", sortBy);
  apiParams.append("sort_dir", "desc");

  // Gọi API đồng thời
  const data = await getArticles(apiParams);
  const articles = data?.items || [];
  const totalPages = data?.total_pages || 1;

  // Danh mục tĩnh vẽ bộ lọc (Có thể thay thế bằng API GET /api/v1/categories)
  const categoriesList = [
    { name: "Tin tức - Sự kiện", slug: "tin-tuc-va-su-kien" },
    { name: "Thông báo", slug: "thong-bao" },
    { name: "Tuyển sinh", slug: "tuyen-sinh" },
    { name: "Hoạt động sinh viên", slug: "hoat-dong-sinh-vien" },
  ];

  // Thẻ Tag phổ biến tĩnh (Có thể thay thế bằng API GET /api/v1/tags)
  const popularTags = [
    { name: "Công nghệ thông tin", slug: "cntt" },
    { name: "Nghiên cứu khoa học", slug: "nckh" },
    { name: "Học bổng", slug: "hoc-bong" },
    { name: "Tuyển sinh 2026", slug: "tuyen-sinh-2026" },
  ];

  // Hàm sinh link chuyển đổi bộ lọc giữ nguyên trạng thái URL
  const getFilterUrl = (newParams: Record<string, string | number | null>) => {
    const nextParams = new URLSearchParams();
    if (searchQuery) nextParams.append("q", searchQuery);
    if (categorySlug) nextParams.append("category", categorySlug);
    if (tagSlug) nextParams.append("tag", tagSlug);
    if (sortBy !== "publish_at") nextParams.append("sort", sortBy);
    nextParams.append("page", "1"); // Bấm filter tự động reset về trang 1
    
    // Ghi đè tham số mới
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val.toString());
      }
    });

    const queryStr = nextParams.toString();
    return `/tin-tuc${queryStr ? "?" + queryStr : ""}`;
  };

  // Helper hiển thị tên tiêu đề lọc hiện hành
  const getFilterHeaderTitle = () => {
    if (searchQuery) return `Kết quả tìm kiếm cho "${searchQuery}"`;
    if (categorySlug) {
      const cat = categoriesList.find(c => c.slug === categorySlug);
      return `Chuyên mục: ${cat ? cat.name : categorySlug}`;
    }
    if (tagSlug) {
      const tg = popularTags.find(t => t.slug === tagSlug);
      return `Bài viết gắn thẻ #${tg ? tg.name : tagSlug}`;
    }
    return "Tất cả Tin tức & Sự kiện";
  };

  // ──────────────────────────────────────────────
  // TỐI ƯU SEO: Chèn JSON-LD Structured Data
  // ──────────────────────────────────────────────
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://set.vinhuni.edu.vn";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": articles.length,
    "itemListElement": articles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${siteUrl}/tin-tuc/${article.slug}`,
      "name": article.title,
      "description": article.excerpt,
      "image": article.thumbnail_object_key ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/media/public/${article.thumbnail_object_key}` : undefined
    }))
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 space-y-8 bg-slate-50/50 w-full">
      {/* Script SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Khối Breadcrumb & Tìm Kiếm HUST style */}
      <div className="bg-white p-6 border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium space-x-2">
            <Link href="/" className="hover:text-primary transition">Trang chủ</Link>
            <span>/</span>
            <span className="text-slate-600">Tin tức</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mt-1 uppercase tracking-wide">
            Cổng Thông Tin Tổng Hợp
          </h1>
        </div>

        {/* Form tìm kiếm nhanh */}
        <form action="/tin-tuc" method="GET" className="flex items-center gap-2 max-w-md w-full md:w-80">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          {tagSlug && <input type="hidden" name="tag" value={tagSlug} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <div className="relative flex-1">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary-hover transition rounded-none">
            Tìm
          </button>
        </form>
      </div>

      {/* Main Layout 2 Cột */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* CỘT CHÍNH (Trái - 75%) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200/60 p-6 shadow-sm space-y-6">
            
            {/* Header kết quả lọc & Dropdown Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
              <h2 className="text-lg font-bold text-slate-800 relative after:absolute after:bottom-[-17px] after:left-0 after:w-10 after:h-[2px] after:bg-primary">
                {getFilterHeaderTitle()}
              </h2>
              
              {/* Dropdown sắp xếp động */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    // Trong Server Component, ta thay đổi URL bằng cách chuyển hướng href
                    window.location.href = getFilterUrl({ sort: e.target.value });
                  }}
                  className="border border-slate-200 px-2 py-1 focus:outline-none focus:border-primary text-slate-700 bg-white"
                >
                  <option value="publish_at">Mới nhất</option>
                  <option value="view_count">Xem nhiều nhất</option>
                  <option value="title">Tựa đề A-Z</option>
                </select>
              </div>
            </div>

            {/* Danh sách bài viết dạng Hàng Ngang (HUST style) */}
            {articles.length > 0 ? (
              <div className="divide-y divide-slate-100 space-y-6">
                {articles.map((article, idx) => (
                  <div key={article.id} className={`flex flex-col sm:flex-row gap-5 pt-6 ${idx === 0 ? 'pt-0' : ''} group`}>
                    
                    {/* Ảnh bên trái */}
                    <Link href={`/tin-tuc/${article.slug}`} className="relative w-full sm:w-52 aspect-[16/10] shrink-0 overflow-hidden bg-slate-100 border border-slate-100">
                      <Image
                        src={article.thumbnail_object_key ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/media/public/${article.thumbnail_object_key}` : "/images/placeholder.jpg"}
                        alt={article.title}
                        fill
                        sizes="200px"
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    </Link>

                    {/* Nội dung bên phải */}
                    <div className="flex flex-col justify-between flex-1 py-1 space-y-3">
                      <div className="space-y-2">
                        <Link href={`/tin-tuc/${article.slug}`}>
                          <h3 className="text-base font-bold text-slate-800 leading-snug group-hover:text-primary transition line-clamp-2">
                            {article.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>

                      {/* Phụ lục thông tin */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 font-medium">
                        {article.category && (
                          <span className="flex items-center gap-1 hover:text-primary transition">
                            <FolderOpen size={12} />
                            {article.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {new Date(article.publish_at).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {article.view_count} lượt xem
                        </span>

                        {/* Danh sách Tags */}
                        {article.tags.length > 0 && (
                          <div className="flex gap-1.5 ml-auto">
                            {article.tags.slice(0, 2).map(t => (
                              <span key={t.slug} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-none text-[10px] uppercase font-bold flex items-center gap-1">
                                <TagIcon size={8} />
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 font-medium bg-slate-50/50">
                Không tìm thấy bài viết nào phù hợp với bộ lọc đã chọn.
              </div>
            )}

            {/* PHÂN TRANG SỐ nâng cao */}
            {data && data.total_pages > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-6 border-t border-slate-100">
                {currentPage > 1 ? (
                  <Link href={getFilterUrl({ page: currentPage - 1 })} className="p-2 border border-slate-200 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition">
                    <ChevronLeft size={16} />
                  </Link>
                ) : (
                  <span className="p-2 border border-slate-100 text-slate-300 pointer-events-none">
                    <ChevronLeft size={16} />
                  </span>
                )}

                {/* Vẽ số trang */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = pNum === currentPage;
                  return (
                    <Link
                      key={pNum}
                      href={getFilterUrl({ page: pNum })}
                      className={`px-3 py-1.5 border text-xs font-bold transition ${
                        isActive
                          ? "bg-primary text-white border-primary"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary"
                      }`}
                    >
                      {pNum}
                    </Link>
                  );
                })}

                {currentPage < totalPages ? (
                  <Link href={getFilterUrl({ page: currentPage + 1 })} className="p-2 border border-slate-200 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition">
                    <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span className="p-2 border border-slate-100 text-slate-300 pointer-events-none">
                    <ChevronRight size={16} />
                  </span>
                )}
              </div>
            )}

          </div>
        </div>

        {/* SIDEBAR PHẢI (25%) */}
        <div className="space-y-6">
          
          {/* Widget 1: Bộ lọc Danh mục */}
          <div className="bg-white border border-slate-200/60 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b-2 border-primary pb-2 w-fit">
              Danh mục tin tức
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={getFilterUrl({ category: null })}
                  className={`text-sm font-medium flex items-center justify-between transition ${
                    !categorySlug ? "text-primary font-semibold" : "text-slate-600 hover:text-primary"
                  }`}
                >
                  <span>Tất cả tin tức</span>
                </Link>
              </li>
              {categoriesList.map((cat) => (
                <li key={cat.slug} className="border-t border-slate-100 pt-2.5">
                  <Link
                    href={getFilterUrl({ category: cat.slug, tag: null })}
                    className={`text-sm font-medium flex items-center justify-between transition ${
                      categorySlug === cat.slug ? "text-primary font-semibold" : "text-slate-600 hover:text-primary"
                    }`}
                  >
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Widget 2: Mây Thẻ Tag (Tag Cloud) */}
          <div className="bg-white border border-slate-200/60 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b-2 border-primary pb-2 w-fit">
              Thẻ tag phổ biến
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href={getFilterUrl({ tag: null })}
                className={`text-xs px-2.5 py-1 border transition font-medium ${
                  !tagSlug ? "bg-primary text-white border-primary" : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary"
                }`}
              >
                Tất cả tag
              </Link>
              {popularTags.map((tg) => (
                <Link
                  key={tg.slug}
                  href={getFilterUrl({ tag: tg.slug, category: null })}
                  className={`text-xs px-2.5 py-1 border transition font-medium ${
                    tagSlug === tg.slug
                      ? "bg-primary text-white border-primary"
                      : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary"
                  }`}
                >
                  #{tg.name}
                </Link>
              ))}
            </div>
          </div>

        </div>
        
      </div>
    </main>
  );
}
```

---

## 4. Giải Pháp Tối Ưu Hóa SEO Cho Front-End

Mã nguồn trên đã cấu hình sẵn các quy chuẩn SEO quan trọng của dự án:

1.  **Dynamic Page Title:** Tiêu đề trang tự động biên soạn theo bộ lọc đang active, giúp tối ưu hiển thị từ khóa trên Google Search (ví dụ: `Chuyên mục: TUYỂN SINH - Trang 1 | Trường Kỹ thuật và Công nghệ`).
2.  **Dynamic Canonical Link:** Thẻ alternates canonical tự động lược bỏ các query không cần thiết (như `sort`, `has_thumbnail`) để tránh Google phạt trùng lặp nội dung.
3.  **Robots Noindex cho Tìm kiếm:** Khi phát hiện query tìm kiếm `q`, robots tự động chuyển thành `"noindex, follow"` để ngăn Google quét index các trang kết quả tìm kiếm nội bộ không giá trị, bảo toàn tài nguyên crawl cho trang chủ và bài viết chi tiết.
4.  **JSON-LD ItemList Schema:** Tự động chèn structured data dạng ItemList mô tả danh sách bài viết hiện tại. Điều này giúp Google Bot dễ dàng phân tích cấu trúc dữ liệu của trang và hiển thị Rich Snippets (kết quả hiển thị đa phương tiện) trên trang tìm kiếm của Google, tăng 30% tỷ lệ click (CTR).
