import { SafeImage } from "@/shared/components/ui/safe-image";
import { Link } from "@/i18n/routing";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { NoticeItem, ScholarshipItem } from "../types/notification.types";

const defaultNotices: NoticeItem[] = [
  {
    id: 1,
    title: "Kế hoạch tổ chức Hội thảo khoa học quốc tế lần thứ 3",
    titleEn: "Plan to Organize the 3rd International Scientific Conference",
    date: "13/01/2026",
    href: "/tin-tuc?category_slug=thong-bao",
  },
  {
    id: 2,
    title: "Tổ chức Hội thảo quốc tế 2024: Phát triển bền vững kinh tế Việt Nam trong bối cảnh mới",
    titleEn:
      "Organizing 2024 International Conference: Sustainable Development of Vietnam Economy in New Context",
    date: "02/01/2025",
    href: "/tin-tuc?category_slug=thong-bao",
  },
  {
    id: 3,
    title: "Thông báo tổ chức hội thảo khoa học thường niên",
    titleEn: "Announcement of the Annual Scientific Conference Organization",
    date: "13/07/2024",
    href: "/tin-tuc?category_slug=thong-bao",
  },
  {
    id: 4,
    title: "Thông báo về việc mở các khóa bồi dưỡng Kế toán trưởng năm 2023",
    titleEn: "Notification on Opening Chief Accountant Training Courses in 2023",
    date: "03/08/2023",
    href: "/tin-tuc?category_slug=thong-bao",
  },
];

const defaultScholarships: ScholarshipItem[] = [
  {
    id: 1,
    title: "Thông báo tuyển sinh đi học tại Ba Lan năm 2022",
    titleEn: "Notification of Admissions for Studying in Poland in 2022",
    imageUrl: "/Upload/images/HOCBONG/2022-hoc-bong-ba-lan.jpg",
    date: "06/04/2022",
    href: "/tin-tuc?category_slug=hoc-bong",
  },
  {
    id: 2,
    title: "Thông báo tuyển sinh đi học tại Trung Quốc năm 2022",
    titleEn: "Notification of Admissions for Studying in China in 2022",
    imageUrl: "/Upload/images/THONGBAO/2022_hoc-bong_002.jpg",
    date: "05/04/2022",
    href: "/tin-tuc?category_slug=hoc-bong",
  },
  {
    id: 3,
    title: "Thông báo tuyển sinh đi học Tiến sĩ ở Nhật Bản niên khóa 2022-2025",
    titleEn: "Notification of Admissions for PhD Program in Japan for Academic Year 2022-2025",
    imageUrl: "/Upload/images/THONGBAO/2022_hoc-bong_001.jpg",
    date: "05/04/2022",
    href: "/tin-tuc?category_slug=hoc-bong",
  },
];

// 1. Component Danh sách Thông báo
export function NoticeSection({
  notices = defaultNotices,
  categorySlug = "thong-bao",
}: {
  notices?: NoticeItem[];
  categorySlug?: string;
}) {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="space-y-6">
      {/* Tiêu đề Section */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="section-heading">{t("notices_title")}</h2>
        <Link
          href={`/tin-tuc?category_slug=${categorySlug}`}
          className="group text-brand-darkred hover:bg-brand-darkred/5 hover:text-brand-darkred-dark inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold transition-colors duration-150"
        >
          <span>{t("view_all")}</span>
          <ArrowRight
            size={16}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <ul className="divide-border divide-y">
        {notices.map((notice) => {
          const title = locale === "en" ? notice.titleEn || notice.title : notice.title;
          return (
            <li key={notice.id} className="group py-4 first:pt-0">
              <Link href={notice.href} className="block space-y-2 rounded-md">
                <h4 className="group-hover:text-brand-darkred line-clamp-2 text-base leading-snug font-semibold text-slate-800 transition-colors duration-150">
                  {title}
                </h4>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <CalendarDays size={14} aria-hidden="true" />
                  <span>{notice.date}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 2. Component Danh sách Học bổng
export function ScholarshipSection({
  scholarships = defaultScholarships,
  categorySlug = "hoc-bong",
}: {
  scholarships?: ScholarshipItem[];
  categorySlug?: string;
}) {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="space-y-6">
      {/* Tiêu đề Section */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="section-heading">{t("scholarships_title")}</h2>
        <Link
          href={`/tin-tuc?category_slug=${categorySlug}`}
          className="group text-brand-darkred hover:bg-brand-darkred/5 hover:text-brand-darkred-dark inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold transition-colors duration-150"
        >
          <span>{t("view_all")}</span>
          <ArrowRight
            size={16}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <ul className="space-y-4">
        {scholarships.map((item) => {
          const title = locale === "en" ? item.titleEn || item.title : item.title;
          return (
            <li
              key={item.id}
              className="group border-border hover:border-brand-blue/25 flex gap-4 rounded-lg border bg-white p-3.5 transition-colors duration-150"
            >
              <Link
                href={item.href}
                className="bg-surface relative block h-16 w-24 shrink-0 overflow-hidden rounded-md"
              >
                <SafeImage
                  src={item.imageUrl}
                  alt={title}
                  fill
                  sizes="100px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <Link href={item.href}>
                  <h4 className="group-hover:text-brand-darkred line-clamp-2 text-sm leading-snug font-semibold text-slate-800 transition-colors duration-150">
                    {title}
                  </h4>
                </Link>
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <CalendarDays size={14} aria-hidden="true" />
                  <span>{item.date}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
