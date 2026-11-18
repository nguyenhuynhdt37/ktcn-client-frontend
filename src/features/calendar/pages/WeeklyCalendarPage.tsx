import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { WeeklyCalendarDashboard } from "../components/weekly-calendar-dashboard";
import { calendarService } from "../services/calendarService";
import { formatDate } from "@/features/article/utils/map-article";
import { Link } from "@/i18n/routing";

interface WeeklyCalendarPageProps {
  locale: string;
  page?: string;
}

export async function WeeklyCalendarPage({ locale, page }: WeeklyCalendarPageProps) {
  // Thiết lập locale để kích hoạt static rendering / server rendering đa ngôn ngữ
  setRequestLocale(locale);

  const parsedPage = Number.parseInt(page || "1", 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  // 1. Gọi API lấy danh sách bài viết lịch tuần để lấy tuần mới nhất
  const articlesData = await calendarService.getWeeklyCalendars(currentPage, locale);

  const listItems = articlesData?.items.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    publishedAt: formatDate(item.published_at, locale),
  })) || [];

  // 2. Tự động chuyển hướng (Redirect) trực tiếp đến bài viết lịch tuần mới nhất kèm query page=1
  const latestArticle = listItems[0];
  if (latestArticle) {
    const targetPath = locale === "en"
      ? `/en/weekly-calendar/${latestArticle.slug}?page=1`
      : `/vi/lich-tuan/${latestArticle.slug}?page=1`;
    redirect(targetPath);
  }

  // Cấu hình fallback trong trường hợp hoàn toàn không có lịch tuần nào trong Database
  const mappedActiveArticle = {
    id: "empty",
    title: locale === "en" ? "No Calendar Available" : "Không có lịch công tác",
    excerpt: "",
    content: `<p class="text-slate-400 italic text-center py-8">${
      locale === "en" ? "No calendar has been published yet." : "Chưa có lịch công tác nào được đăng tải."
    }</p>`,
    publishedAt: "",
  };

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
              <span className="text-slate-600">
                {locale === "en" ? "Weekly Calendar" : "Lịch công tác tuần"}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Render Dashboard Lịch tuần rỗng */}
      <WeeklyCalendarDashboard
        activeArticle={mappedActiveArticle}
        listItems={listItems}
        activeSlug=""
        currentPage={currentPage}
        totalPages={articlesData?.total_pages || 1}
        hasNext={articlesData?.has_next || false}
        hasPrevious={articlesData?.has_previous || false}
        locale={locale}
      />
    </div>
  );
}
