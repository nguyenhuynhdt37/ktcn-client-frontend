import type { ReactNode } from "react";
import { CalendarDays, Newspaper } from "lucide-react";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { sanitizeRichHtml } from "@/shared/lib/security";
import { formatDate, getLocalizedField } from "@/features/article/utils/map-article";
import type { PortalArticleListResponse } from "@/features/article/types/article.types";
import type { DepartmentOverview, PortalProgram } from "@/features/department/types/department.types";
import { getStaffQualifications } from "@/features/lecturer/utils/staff-directory";
import { facultySections, firstRichText, htmlToPlainText, programHref, telHref } from "../utils/inner";
import { CetAvatar } from "./CetAvatar";
import { CetLink } from "./CetLink";
import { CetPageHeader } from "./CetPageHeader";
import { CetSideCard } from "./CetSideCard";
import base from "../cet.module.css";
import styles from "../cet-inner.module.css";

type Staff = DepartmentOverview["staffs"][number];

const NEWS_LIMIT = 3;

function degreeLabel(level: string, isEn: boolean): string {
  if (level === "bachelor") return isEn ? "Bachelor" : "Đại học";
  if (level === "master") return isEn ? "Master" : "Thạc sĩ";
  return "";
}

function ProgramTile({ program, locale }: { program: PortalProgram; locale: string }) {
  const isEn = locale === "en";
  const summary = htmlToPlainText(program.short_description);
  const meta = [
    degreeLabel(program.degree_level, isEn),
    program.duration_years ? `${program.duration_years} ${isEn ? "years" : "năm"}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <CetLink className={styles.orgFaculty} href={programHref(program)} locale={locale}>
      <h3>{program.name}</h3>
      {meta && <p>{meta}</p>}
      {summary && <p className={styles.tileSummary}>{summary}</p>}
    </CetLink>
  );
}

function NewsTile({ item, locale }: { item: PortalArticleListResponse; locale: string }) {
  const title = getLocalizedField<string>(item, "title", locale);
  const href = `/tin-tuc/${item.slug}`;
  return (
    <article className={base.newsCard}>
      <CetLink
        className={
          item.thumbnail_object_key ? base.thumbnail : `${base.thumbnail} ${styles.placeholderThumb}`
        }
        href={href}
        locale={locale}
        tabIndex={-1}
        aria-hidden="true"
      >
        {item.thumbnail_object_key ? (
          <SafeImage
            src={item.thumbnail_object_key}
            fallbackSrc="/images/no-image-dhv.jpg"
            alt=""
            fill
            sizes="(min-width: 992px) 250px, (min-width: 576px) 33vw, 100vw"
          />
        ) : (
          <Newspaper size={36} strokeWidth={1.5} aria-hidden="true" />
        )}
      </CetLink>
      <div className={base.newsBody}>
        <h3 className={styles.newsTileTitle}>
          <CetLink href={href} locale={locale}>
            {title}
          </CetLink>
        </h3>
        {item.published_at && (
          <time dateTime={item.published_at}>
            <CalendarDays size={14} aria-hidden="true" />
            {formatDate(item.published_at, locale)}
          </time>
        )}
      </div>
    </article>
  );
}

function StaffRow({ staff, locale }: { staff: Staff; locale: string }) {
  const name = (staff.full_name ?? "").trim();
  const label = [getStaffQualifications(staff, locale), name].filter(Boolean).join(" ");
  const position = staff.position_name?.trim();
  const bio = htmlToPlainText(staff.biography);
  // The bio often just repeats the position ("Trưởng Bộ môn"); show it only when it adds something.
  const showBio = bio && bio.toLocaleLowerCase() !== (position ?? "").toLocaleLowerCase();

  return (
    <article className={`${styles.staffCard} ${styles.facultyStaff}`}>
      <CetAvatar name={name} src={staff.avatar_object_key} />
      <div className={styles.staffBody}>
        {label && (
          <h3 className={styles.staffName}>
            {staff.slug ? (
              <CetLink href={`/nhan-su/${staff.slug}`} locale={locale}>
                {label}
              </CetLink>
            ) : (
              label
            )}
          </h3>
        )}
        {position && <p className={styles.staffPosition}>{position}</p>}
        {showBio && <p className={`${styles.dutyText} ${styles.staffBio}`}>{bio}</p>}
      </div>
    </article>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.facultySection} aria-labelledby={`${id}-title`}>
      <h2 className={base.sectionTitle} id={`${id}-title`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CetFaculty({ overview, locale }: { overview: DepartmentOverview; locale: string }) {
  const isEn = locale === "en";
  const { department } = overview;
  const staffs = overview.staffs ?? [];
  const programs = overview.programs ?? [];
  const articles = (overview.latest_articles ?? []).slice(0, NEWS_LIMIT);

  // Pick the first candidate with visible text: a CMS value like "<p>&nbsp;</p>" must not hide the fallback.
  const aboutHtml = sanitizeRichHtml(firstRichText([department.description, department.short_description]));
  const missionHtml = sanitizeRichHtml(firstRichText([department.mission]));
  const visionHtml = sanitizeRichHtml(firstRichText([department.vision]));
  const hasAboutText = Boolean(htmlToPlainText(aboutHtml));
  const hasMission = Boolean(htmlToPlainText(missionHtml));
  const hasVision = Boolean(htmlToPlainText(visionHtml));
  const hasAbout = hasAboutText || hasMission || hasVision;

  const sections = facultySections(
    { description: hasAbout, programs: programs.length, articles: articles.length, staffs: staffs.length },
    isEn,
  );
  const titles = Object.fromEntries(sections.map((section) => [section.id, section.label]));
  const has = (id: string) => id in titles;

  const phone = department.phone?.trim();
  const phoneHref = telHref(phone);
  const email = department.email?.trim();
  const office = department.office?.trim();
  const hasContact = Boolean(phone || email || office);
  const hasSidebar = sections.length > 0 || hasContact;

  const orgTitle = isEn ? "Organisation" : "Cơ cấu tổ chức";

  return (
    <>
      <CetPageHeader
        title={department.name}
        crumbs={[{ label: orgTitle, href: "/gioi-thieu/cac-khoa-dao-tao" }, { label: department.name }]}
        locale={locale}
      />
      <div className={`${base.container} ${styles.layout} ${hasSidebar ? "" : styles.layoutSingle}`}>
        <div className={styles.facultyMain}>
          {has("gioi-thieu") && (
            <Section id="gioi-thieu" title={titles["gioi-thieu"]}>
              {hasAboutText && (
                <div
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: aboutHtml }}
                />
              )}
              {hasMission && (
                <div className={styles.subBlock}>
                  <h3 className={styles.subTitle}>{isEn ? "Mission" : "Sứ mệnh"}</h3>
                  <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: missionHtml }} />
                </div>
              )}
              {hasVision && (
                <div className={styles.subBlock}>
                  <h3 className={styles.subTitle}>{isEn ? "Vision" : "Tầm nhìn"}</h3>
                  <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: visionHtml }} />
                </div>
              )}
            </Section>
          )}

          {has("chuong-trinh-dao-tao") && (
            <Section id="chuong-trinh-dao-tao" title={titles["chuong-trinh-dao-tao"]}>
              <ul className={styles.programGrid}>
                {programs.map((program) => (
                  <li key={program.id}>
                    <ProgramTile program={program} locale={locale} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {has("tin-tuc") && (
            <Section id="tin-tuc" title={titles["tin-tuc"]}>
              <ul className={styles.facultyNews}>
                {articles.map((item) => (
                  <li key={item.id}>
                    <NewsTile item={item} locale={locale} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {has("can-bo") && (
            <Section id="can-bo" title={isEn ? "Staff" : "Đội ngũ cán bộ"}>
              <ul className={styles.facultyStaffList}>
                {staffs.map((staff) => (
                  <li key={staff.id}>
                    <StaffRow staff={staff} locale={locale} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {sections.length === 0 && (
            <p className={styles.emptyState}>
              {isEn ? "No content has been published yet." : "Chưa có nội dung được đăng tải."}
            </p>
          )}
        </div>

        {hasSidebar && (
          <aside aria-label={isEn ? "Sidebar" : "Thanh bên"}>
            {sections.length > 0 && (
              <CetSideCard title={department.name}>
                <nav aria-label={isEn ? "On this page" : "Nội dung trang"}>
                  <ul className={styles.sideList}>
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a href={`#${section.id}`}>{section.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </CetSideCard>
            )}
            {hasContact && (
              <CetSideCard title={isEn ? "Contact" : "Thông tin liên hệ"}>
                <dl className={styles.contactList}>
                  {office && (
                    <div>
                      <dt>{isEn ? "Office" : "Văn phòng"}</dt>
                      <dd>{office}</dd>
                    </div>
                  )}
                  {phone && (
                    <div>
                      <dt>{isEn ? "Phone" : "Điện thoại"}</dt>
                      <dd>
                        {phoneHref ? <a href={phoneHref}>{phone}</a> : phone}
                      </dd>
                    </div>
                  )}
                  {email && (
                    <div>
                      <dt>Email</dt>
                      <dd>
                        <a href={`mailto:${email}`}>{email}</a>
                      </dd>
                    </div>
                  )}
                </dl>
              </CetSideCard>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
