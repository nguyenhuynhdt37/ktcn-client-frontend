# Hướng dẫn Tích hợp API Chi tiết Bài viết & Tối ưu hóa SEO (Next.js App Router)

API lấy chi tiết bài viết dành cho Portal (`GET /api/v1/articles/portal/{slug}`) đã được Backend tối ưu hóa SEO toàn diện, tự động sinh ra các siêu dữ liệu SEO (Title, Description, Canonical URL, OpenGraph) và cấu trúc dữ liệu JSON-LD (`NewsArticle` của Schema.org). 

Tài liệu này hướng dẫn cách Front-End Client khai thác dữ liệu này để thiết lập cấu trúc SEO chuẩn mực nhất trên Next.js App Router.

---

## 1. Cấu trúc Dữ liệu SEO từ API Backend

Khi gọi `GET /api/v1/articles/portal/{slug}`, Backend sẽ trả về `PortalArticleDetailResponse` có các trường SEO quan trọng sau:

```json
{
  "id": "uuid",
  "title": "TIÊU ĐỀ BÀI VIẾT",
  "slug": "tieu-de-bai-viet-slug",
  "excerpt": "Tóm tắt bài viết...",
  "content": "<p>Nội dung HTML bài viết...</p>",
  "thumbnail_url": "http://localhost:9000/university-media/files/thumb.png",
  "cover_url": "http://localhost:9000/university-media/files/cover.png",
  "og_image_url": "http://localhost:9000/university-media/files/thumb.png",
  "seo_title": "Tiêu đề SEO tối ưu",
  "seo_description": "Mô tả SEO tối ưu (được cắt 160 ký tự đầu và loại bỏ HTML)",
  "robots": "index, follow",
  "canonical_url": "http://localhost:3000/articles/tieu-de-bai-viet-slug",
  "og_title": "Tiêu đề chia sẻ MXH",
  "og_description": "Mô tả chia sẻ MXH",
  "json_ld": {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "TIÊU ĐỀ BÀI VIẾT",
    "image": [
      "http://localhost:9000/university-media/files/thumb.png"
    ],
    "datePublished": "2026-06-30T02:11:52.999399Z",
    "dateModified": "2026-06-30T02:12:31.374340Z",
    "author": {
      "@type": "Person",
      "name": "Tên Tác Giả"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Viện Kỹ thuật và Công nghệ - Trường Đại học Vinh",
      "logo": {
        "@type": "ImageObject",
        "url": "https://viengktc.example.com/logo.png"
      }
    },
    "description": "Mô tả SEO tối ưu"
  }
}
```

---

## 2. Hướng dẫn tích hợp vào Next.js App Router (FE Client)

Để tối ưu hóa SEO, trang chi tiết bài viết phải được triển khai như một **Server Component**. Chúng ta sẽ sử dụng hàm `generateMetadata` của Next.js để sinh ra các thẻ meta động ở phía Server.

### Bước 1: Khai báo API lấy chi tiết bài viết ở FE
Tạo file `src/features/article/api/get-article-detail.ts`:

```typescript
import { PortalArticleResponse } from "../types";

export interface PortalArticleDetail extends PortalArticleResponse {
  content: string;
  word_count: number;
  reading_time: number;
  thumbnail_url?: string | null;
  cover_url?: string | null;
  updated_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  robots?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  json_ld: Record<string, any>;
}

export async function getArticleDetailServer(slug: string): Promise<PortalArticleDetail | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/articles/portal/${slug}`, {
      next: {
        revalidate: 600 // Cache bài viết 10 phút trên server
      }
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch article: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching article detail (${slug}):`, error);
    return null;
  }
}
```

---

### Bước 2: Tạo trang chi tiết bài viết (`src/app/(public)/tin-tuc/[slug]/page.tsx`)
Tại đây, chúng ta sử dụng `generateMetadata` để cấu hình thẻ Title, Description, Canonical URL và OpenGraph cho Facebook/Zalo. Đồng thời chèn cấu trúc dữ liệu JSON-LD Schema.org trực tiếp vào trang HTML.

```tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, Clock, User } from "lucide-react";
import { getArticleDetailServer } from "@/features/article/api/get-article-detail";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

// 1. Hàm sinh SEO Metadata động phía Server
export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleDetailServer(slug);

  if (!article) {
    return {
      title: "Bài viết không tồn tại",
    };
  }

  // Sử dụng cấu hình SEO được tối ưu từ Backend gửi về
  return {
    title: article.seo_title || article.title,
    description: article.seo_description,
    alternates: {
      canonical: article.canonical_url || undefined,
    },
    robots: article.robots || "index, follow",
    openGraph: {
      title: article.og_title || article.title,
      description: article.og_description || undefined,
      type: "article",
      publishedTime: article.published_at,
      modifiedTime: article.updated_at || undefined,
      authors: [article.author.full_name || article.author.username],
      images: article.og_image_url ? [{ url: article.og_image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.og_title || article.title,
      description: article.og_description || undefined,
      images: article.og_image_url ? [article.og_image_url] : [],
    },
  };
}

// 2. Component Layout & Content hiển thị bài viết
export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = await getArticleDetailServer(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      {/* Chèn cấu trúc dữ liệu JSON-LD Schema.org tối ưu SEO Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article.json_ld) }}
      />

      <article className="max-w-4xl mx-auto px-6 py-12 space-y-8 bg-white my-8 border border-slate-100 shadow-sm">
        {/* Tiêu đề & Thông tin tác giả */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <span className="inline-block bg-brand-darkred/10 text-brand-darkred text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
            {article.category.name}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 pt-2">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              <span className="font-medium text-slate-700">
                {article.author.full_name || article.author.username}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-slate-400" />
              <span>
                {new Date(article.published_at).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <span>{article.reading_time} phút đọc ({article.word_count} từ)</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {article.cover_url && (
          <div className="relative w-full h-[300px] sm:h-[450px] overflow-hidden bg-slate-100">
            <Image
              src={article.cover_url}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-w-1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* Nội dung bài viết chi tiết */}
        <div 
          className="prose prose-slate max-w-none text-slate-800 leading-relaxed 
            prose-headings:font-bold prose-headings:text-slate-900 
            prose-p:mb-5 prose-img:mx-auto prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </>
  );
}
```

---

## 3. Tổng kết các điểm tối ưu SEO đã hoàn thành:
1. **Tiêu đề & Mô tả Tối ưu**: Thẻ `<title>` và `<meta name="description">` được gán động tự động ở phía Server nhờ `generateMetadata`.
2. **OpenGraph & Twitter Cards**: Tương thích tốt với các nền tảng mạng xã hội (Facebook, Zalo, Twitter) hiển thị thumbnail đẹp mắt nhờ `og_image_url`.
3. **Thẻ Canonical**: Thẻ `<link rel="canonical" href="...">` được sinh ra tự động để tránh lỗi trùng lặp nội dung (Duplicate Content) đối với các công cụ tìm kiếm.
4. **Cấu trúc Dữ liệu JSON-LD**: Tích hợp Schema `NewsArticle` giúp trang dễ dàng đạt thứ hạng cao trong kết quả tìm kiếm và đủ điều kiện hiển thị trên Google News.
5. **Server-side Rendering (SSR):** Next.js sinh mã HTML hoàn chỉnh có sẵn toàn bộ thẻ Meta và nội dung bài viết trước khi gửi về Client, giúp các Robot cào dữ liệu nhanh chóng và trọn vẹn nhất.
