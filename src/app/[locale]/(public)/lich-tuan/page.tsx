import { setRequestLocale } from "next-intl/server";
import { WeeklyCalendarPage } from "@/features/calendar";
import { Metadata } from "next";
import { constructMetadata } from "@/shared/lib/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Cấu hình Metadata cho Lịch công tác tuần (mặc định hiển thị tuần mới nhất)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const title = isEn ? "Weekly Working Calendar" : "Lịch Công Tác Tuần";
  const description = isEn
    ? "Weekly working and event schedule of the College of Engineering and Technology - Vinh University."
    : "Lịch làm việc và công tác chi tiết hàng tuần của Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh.";

  return constructMetadata({
    title,
    description,
    locale,
    alternatesLanguages: {
      vi: "lich-tuan",
      en: "weekly-calendar",
    },
  });
}

export default async function CalendarListPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  
  // Thiết lập locale để kích hoạt static rendering / server rendering đa ngôn ngữ
  setRequestLocale(locale);

  const { page } = await searchParams;

  return <WeeklyCalendarPage locale={locale} page={page} />;
}
