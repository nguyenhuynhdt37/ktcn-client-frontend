import Image from "next/image";
import {
  ArrowRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Download,
  Link as LinkIcon,
  type LucideIcon,
  Cpu,
  FileText,
  GraduationCap,
  Mail,
  MessageCircle,
  Network,
  Users,
} from "lucide-react";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { getLocalizedField, formatDate } from "@/features/article/utils/map-article";
import { sentenceCaseTitle } from "../utils/inner";
import type { HomeShortcutItem } from "@/features/setting/types/setting.types";
import type { CetHomeData } from "../services/home-data";
import { CetLink } from "./CetLink";
import styles from "../cet.module.css";

const SHORTCUT_ICONS: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  mail: Mail,
  "file-text": FileText,
  "book-open": BookOpen,
  briefcase: BriefcaseBusiness,
  "message-circle": MessageCircle,
  link: LinkIcon,
  download: Download,
  "graduation-cap": GraduationCap,
  users: Users,
};

const DEFAULT_SHORTCUTS: HomeShortcutItem[] = [
  { label_vi: "Lịch tuần", label_en: "Weekly calendar", href: "/lich-tuan", icon: "calendar", open_in_new_tab: false },
  { label_vi: "Thư điện tử", label_en: "Webmail", href: "https://outlook.office.com/", icon: "mail", open_in_new_tab: true },
  { label_vi: "Văn bản – Biểu mẫu", label_en: "Documents & forms", href: "/tai-lieu/van-ban-bieu-mau", icon: "file-text", open_in_new_tab: false },
  { label_vi: "Bài giảng – Giáo trình", label_en: "Lectures & textbooks", href: "/tai-lieu/bai-giang-giao-trinh", icon: "book-open", open_in_new_tab: false },
  { label_vi: "Thông tin việc làm", label_en: "Career opportunities", href: "/tin-tuc?category_slug=tuyen-dung", icon: "briefcase", open_in_new_tab: false },
  { label_vi: "Hỏi đáp", label_en: "Questions & answers", href: "/tu-van-tuyen-sinh", icon: "message-circle", open_in_new_tab: false },
];

export function CetHome({ data, locale }: { data: CetHomeData; locale: string }) {
  const isEn = locale === "en";
  const { news, notices, programs, faculties, settings } = data;
  const empty = isEn ? "No content has been published yet." : "Chưa có nội dung được đăng tải.";
  const quickLinks = (settings?.home_shortcuts?.length ? settings.home_shortcuts : DEFAULT_SHORTCUTS).map(
    (item) => ({
      title: (isEn ? item.label_en : item.label_vi) || item.label_vi,
      href: item.href,
      icon: SHORTCUT_ICONS[item.icon] ?? LinkIcon,
      newTab: item.open_in_new_tab || /^https?:/i.test(item.href),
    }),
  );
  const school =
    (isEn ? settings?.college_name_en : settings?.college_name_vi) ||
    (isEn ? "College of Engineering and Technology" : "Trường Kỹ thuật và Công nghệ");
  return (
    <>
      {data.unavailable && (
        <div className={styles.apiNotice} role="status">
          {isEn
            ? "Content is temporarily unavailable. Please try again later."
            : "Dữ liệu tạm thời chưa tải được. Vui lòng thử lại sau."}
        </div>
      )}
      <section className={styles.hero} aria-labelledby="cet-hero-title">
        <Image
          className={styles.watermark}
          src="/images/cet-emblem.png"
          width={640}
          height={640}
          loading="eager"
          alt=""
          aria-hidden="true"
        />
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroContent}>
            <h1 id="cet-hero-title">
              {isEn
                ? "Educating engineers and technologists for North Central Vietnam and beyond"
                : "Đào tạo kỹ sư và nhà công nghệ cho Bắc Trung Bộ và cả nước"}
            </h1>
            <p>
              {isEn
                ? `${school}: education connected to practice, research and industry.`
                : `${school}: đào tạo gắn với thực hành, nghiên cứu và nhu cầu của doanh nghiệp.`}
            </p>
            <div className={styles.heroActions}>
              <CetLink
                className={styles.lightButton}
                href="/tin-tuc?category_slug=tuyen-sinh-dai-hoc-chinh-quy"
                locale={locale}
              >
                {isEn ? "Admissions information" : "Thông tin tuyển sinh"}
              </CetLink>
              <CetLink
                className={styles.outlineLightButton}
                href="/gioi-thieu/cac-khoa-dao-tao"
                locale={locale}
              >
                {isEn ? "Organisation" : "Cơ cấu tổ chức"}
              </CetLink>
            </div>
          </div>
          <aside className={styles.notice} aria-labelledby="cet-notice-title">
            <h2 id="cet-notice-title">
              <Bell size={19} aria-hidden="true" />
              {isEn ? "Latest announcements" : "Thông báo mới"}
            </h2>
            <ul>
              {notices.map((item) => (
                <li key={item.id}>
                  <CetLink href={`/tin-tuc/${item.slug}`} locale={locale}>
                    {sentenceCaseTitle(getLocalizedField<string>(item, "title", locale), locale)}
                  </CetLink>
                  <time dateTime={item.published_at}>{formatDate(item.published_at, locale)}</time>
                </li>
              ))}
            </ul>
            {!notices.length && <p className={styles.empty}>{empty}</p>}
            <CetLink
              className={styles.textLink}
              href="/tin-tuc?category_slug=thong-bao"
              locale={locale}
            >
              {isEn ? "All announcements" : "Xem tất cả thông báo"}
              <ChevronRight size={15} aria-hidden="true" />
            </CetLink>
          </aside>
        </div>
      </section>
      <nav className={styles.quick} aria-label={isEn ? "Quick access" : "Truy cập nhanh"}>
        <div className={styles.container}>
          {quickLinks.map(({ title, href, icon: Icon, newTab }) => (
            <CetLink
              key={href}
              href={href}
              locale={locale}
              target={newTab ? "_blank" : undefined}
            >
              <Icon size={25} strokeWidth={1.6} aria-hidden="true" />
              <span>{title}</span>
            </CetLink>
          ))}
        </div>
      </nav>
      <section className={styles.section} aria-labelledby="cet-news-title">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} id="cet-news-title">
            {isEn ? "News & events" : "Tin tức & sự kiện"}
          </h2>
          <div className={styles.newsGrid}>
            {news.map((item) => (
              <article className={styles.newsCard} key={item.id}>
                <CetLink
                  className={styles.thumbnail}
                  href={`/tin-tuc/${item.slug}`}
                  locale={locale}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <SafeImage
                    src={item.thumbnail_object_key || "/images/no-image-dhv.jpg"}
                    fallbackSrc="/images/no-image-dhv.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 992px) 400px, (min-width: 600px) 50vw, 100vw"
                  />
                </CetLink>
                <div className={styles.newsBody}>
                  {item.category && (
                    <CetLink
                      className={styles.tag}
                      href={`/tin-tuc?category_slug=${encodeURIComponent(item.category.slug)}`}
                      locale={locale}
                    >
                      {getLocalizedField<string>(item.category, "name", locale)}
                    </CetLink>
                  )}
                  <h3>
                    <CetLink href={`/tin-tuc/${item.slug}`} locale={locale}>
                      {sentenceCaseTitle(getLocalizedField<string>(item, "title", locale), locale)}
                    </CetLink>
                  </h3>
                  {item.excerpt && <p>{getLocalizedField<string>(item, "excerpt", locale)}</p>}
                  <time dateTime={item.published_at}>
                    <CalendarDays size={14} aria-hidden="true" />
                    {formatDate(item.published_at, locale)}
                  </time>
                </div>
              </article>
            ))}
          </div>
          {!news.length && <p className={styles.empty}>{empty}</p>}
          <div className={styles.sectionAction}>
            <CetLink
              className={styles.outlineButton}
              href="/tin-tuc?category_slug=tin-tuc-va-su-kien"
              locale={locale}
            >
              {isEn ? "More news" : "Xem thêm tin tức"}
              <ArrowRight size={16} aria-hidden="true" />
            </CetLink>
          </div>
        </div>
      </section>
      <section
        className={`${styles.section} ${styles.altSection}`}
        aria-labelledby="cet-programs-title"
      >
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} id="cet-programs-title">
            {isEn ? "Degree programmes" : "Ngành đào tạo"}
          </h2>
          <div className={styles.programGrid}>
            {programs.map((item) => (
              <CetLink
                className={styles.major}
                href={`/dao-tao/dai-hoc/${item.slug}`}
                locale={locale}
                key={item.id}
              >
                <GraduationCap size={28} strokeWidth={1.6} aria-hidden="true" />
                <h3>{item.name}</h3>
                {item.short_description && <p>{item.short_description}</p>}
                {item.code && (
                  <span className={styles.majorMeta}>
                    {isEn ? "Code" : "Mã ngành"}: {item.code}
                    {item.duration_years
                      ? ` · ${item.duration_years} ${isEn ? "years" : "năm"}`
                      : ""}
                  </span>
                )}
              </CetLink>
            ))}
          </div>
          {!programs.length && <p className={styles.empty}>{empty}</p>}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="cet-faculties-title">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} id="cet-faculties-title">
            {isEn ? "Our faculties" : "Các khoa"}
          </h2>
          <div className={styles.facultyGrid}>
            {faculties.map((item) => {
              return (
                <CetLink
                  className={styles.faculty}
                  href={`/khoa/${item.slug}`}
                  locale={locale}
                  key={item.id}
                >
                  <Cpu size={30} strokeWidth={1.5} aria-hidden="true" />
                  <h3>{item.name}</h3>
                  <p>
                    {item.staff_count} {isEn ? "staff" : "cán bộ"} ·{" "}
                    {isEn ? "Meet our staff" : "Xem đội ngũ cán bộ"}
                  </p>
                </CetLink>
              );
            })}
          </div>
          {!faculties.length && <p className={styles.empty}>{empty}</p>}
        </div>
      </section>
      <section
        className={`${styles.stats} ${styles.altSection}`}
        aria-label={isEn ? "College in numbers" : "Nhà trường qua những con số"}
      >
        <div className={styles.container}>
          <div>
            <Users size={24} aria-hidden="true" />
            <strong>{faculties.reduce((total, item) => total + item.staff_count, 0)}</strong>
            <span>{isEn ? "Faculty staff" : "Cán bộ tại các khoa"}</span>
          </div>
          <div>
            <GraduationCap size={24} aria-hidden="true" />
            <strong>{programs.length}</strong>
            <span>{isEn ? "Undergraduate programmes" : "Ngành đào tạo đại học"}</span>
          </div>
          <div>
            <Network size={24} aria-hidden="true" />
            <strong>{faculties.length}</strong>
            <span>{isEn ? "Faculties" : "Khoa đào tạo"}</span>
          </div>
          <div>
            <BookOpen size={24} aria-hidden="true" />
            <strong>{data.labCount ?? "—"}</strong>
            <span>{isEn ? "Laboratory units" : "Đơn vị phòng thí nghiệm"}</span>
          </div>
        </div>
      </section>
    </>
  );
}
