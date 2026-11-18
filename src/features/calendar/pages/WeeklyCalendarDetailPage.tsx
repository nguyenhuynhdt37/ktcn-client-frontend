import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { WeeklyCalendarDashboard } from "../components/weekly-calendar-dashboard";
import { calendarService } from "../services/calendarService";
import { formatDate } from "@/features/article/utils/map-article";
import { Link } from "@/i18n/routing";

interface WeeklyCalendarDetailPageProps {
  locale: string;
  slug: string;
  page?: string;
}

export async function WeeklyCalendarDetailPage({ locale, slug, page }: WeeklyCalendarDetailPageProps) {
  // Thiết lập locale để kích hoạt static rendering / server rendering đa ngôn ngữ
  setRequestLocale(locale);

  const parsedPage = Number.parseInt(page || "1", 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  // Gọi đồng thời API chi tiết lịch tuần đang chọn và danh sách lịch tuần ở Sidebar thông qua calendarService
  const [article, articlesData] = await Promise.all([
    calendarService.getWeeklyCalendarDetail(slug),
    calendarService.getWeeklyCalendars(currentPage, locale),
  ]);

  if (!article) {
    notFound();
  }

  // Ánh xạ dữ liệu bài viết đang chọn
  const mappedActiveArticle = {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    publishedAt: formatDate(article.published_at, locale),
    authorName: article.author?.full_name || undefined,
  };

  // Ánh xạ danh sách lịch tuần ở Sidebar
  const listItems = articlesData?.items.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    publishedAt: formatDate(item.published_at, locale),
  })) || [];

  return (
    <div className="w-full max-w-[96%] sm:max-w-[98%] mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-xs font-semibold text-slate-400 select-none uppercase tracking-wider" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link href="/" className="hover:text-brand-darkred transition-colors duration-150">
              {locale === "en" ? "Home" : "Trang chủ"}
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-slate-300">/</span>
              <Link href="/lich-tuan" className="hover:text-brand-darkred transition-colors duration-150">
                {locale === "en" ? "Weekly Calendar" : "Lịch công tác tuần"}
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {article.title}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Render Dashboard Lịch tuần */}
      <WeeklyCalendarDashboard
        activeArticle={mappedActiveArticle}
        listItems={listItems}
        activeSlug={slug}
        currentPage={currentPage}
        totalPages={articlesData?.total_pages || 1}
        hasNext={articlesData?.has_next || false}
        hasPrevious={articlesData?.has_previous || false}
        locale={locale}
      />
    </div>
  );
}
