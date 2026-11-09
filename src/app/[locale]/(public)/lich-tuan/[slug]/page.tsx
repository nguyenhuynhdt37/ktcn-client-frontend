import { setRequestLocale } from "next-intl/server";
import { WeeklyCalendarDetailPage } from "@/features/calendar";
import { articleService } from "@/features/article";
import { Metadata } from "next";
import { constructMetadata, buildBreadcrumbSchema } from "@/shared/lib/seo";
import { serializeJsonLd } from "@/shared/lib/security";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Cấu hình Metadata động từ dữ liệu bài viết lịch tuần của API
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = await articleService.getArticleDetail(slug);
  const isEn = locale === "en";

  if (!article) {
    return {
      title: locale === "en" ? "Calendar Not Found" : "Không tìm thấy lịch công tác",
    };
  }

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || "";

  return constructMetadata({
    title,
    description,
    locale,
    slug: `${isEn ? "weekly-calendar" : "lich-tuan"}/${slug}`,
    alternatesLanguages: {
      vi: `lich-tuan/${slug}`,
      en: `weekly-calendar/${slug}`,
    },
    type: "article",
    publishedTime: article.published_at,
    modifiedTime: article.updated_at || undefined,
    robots: article.robots ? article.robots.split(",").map(r => r.trim()) as any : undefined,
  });
}

export default async function CalendarDetailPage({ params, searchParams }: PageProps) {
  const { slug, locale } = await params;
  const isEn = locale === "en";

  // Thiết lập locale để kích hoạt static rendering / server rendering đa ngôn ngữ
  setRequestLocale(locale);

  const { page } = await searchParams;
  const article = await articleService.getArticleDetail(slug);

  const breadcrumbItems = [
    { name: isEn ? "Home" : "Trang chủ", url: "/" },
    { name: isEn ? "Weekly Calendar" : "Lịch công tác tuần", url: isEn ? "/weekly-calendar" : "/lich-tuan" },
    ...(article ? [{ name: article.title, url: `/${locale}/${isEn ? "weekly-calendar" : "lich-tuan"}/${slug}` }] : []),
  ];

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <WeeklyCalendarDetailPage locale={locale} slug={slug} page={page} />
    </>
  );
}
