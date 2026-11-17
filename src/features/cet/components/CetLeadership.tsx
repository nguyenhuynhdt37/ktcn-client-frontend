import type { DepartmentOverview } from "@/features/department/types/department.types";
import { getStaffQualifications } from "@/features/lecturer/utils/staff-directory";
import type { CetFacultySummary } from "../services/department-data";
import { groupLeaders, htmlToPlainText, telHref } from "../utils/inner";
import { CetAvatar } from "./CetAvatar";
import { CetLink } from "./CetLink";
import { CetPageHeader } from "./CetPageHeader";
import { CetSideCard } from "./CetSideCard";
import base from "../cet.module.css";
import styles from "../cet-inner.module.css";

type Staff = DepartmentOverview["staffs"][number];

function StaffCard({
  staff,
  locale,
  NameTag,
}: {
  staff: Staff;
  locale: string;
  NameTag: "h3" | "h4";
}) {
  const isEn = locale === "en";
  const name = (staff.full_name ?? "").trim();
  const qualifications = getStaffQualifications(staff, locale);
  const position = staff.position_name?.trim();
  const duty = htmlToPlainText(staff.biography);
  const label = [qualifications, name].filter(Boolean).join(" ");

  return (
    <article className={styles.staffCard}>
      <CetAvatar name={name} src={staff.avatar_object_key} />
      <div className={styles.staffBody}>
        {label && (
          <NameTag className={styles.staffName}>
            {staff.slug ? (
              <CetLink href={`/nhan-su/${staff.slug}`} locale={locale}>
                {label}
              </CetLink>
            ) : (
              label
            )}
          </NameTag>
        )}
        {position && <p className={styles.staffPosition}>{position}</p>}
        {duty && (
          <>
            <p className={styles.dutyLabel}>{isEn ? "Responsibilities" : "Nhiệm vụ"}</p>
            <p className={styles.dutyText}>{duty}</p>
          </>
        )}
      </div>
    </article>
  );
}

function programCountLabel(count: number, isEn: boolean): string {
  if (isEn) return `${count} ${count === 1 ? "programme" : "programmes"}`;
  return `${count} ngành đào tạo`;
}

export function CetLeadership({
  overview,
  faculties,
  locale,
}: {
  overview: DepartmentOverview;
  faculties: CetFacultySummary[];
  locale: string;
}) {
  const isEn = locale === "en";
  const { department } = overview;
  const staffs = overview.staffs ?? [];
  const groups = groupLeaders(staffs, isEn);
  const showGroupTitles = groups.length > 1;
  const orgTitle = isEn ? "Organisation" : "Cơ cấu tổ chức";
  const boardTitle = isEn ? "Board of Management" : "Ban Giám hiệu";
  const facultiesTitle = isEn ? "Faculties" : "Các khoa";
  const meetStaff = isEn ? "Meet our staff" : "Xem đội ngũ cán bộ";

  const phone = department.phone?.trim();
  const phoneHref = telHref(phone);
  const email = department.email?.trim();
  const office = department.office?.trim();
  const hasContact = Boolean(phone || email || office);

  return (
    <>
      <CetPageHeader title={orgTitle} crumbs={[{ label: orgTitle }]} locale={locale} />
      <div className={`${base.container} ${styles.orgPage}`}>
        <section className={styles.orgSection} aria-labelledby="cet-board-title">
          <h2 className={base.sectionTitle} id="cet-board-title">
            {boardTitle}
          </h2>
          {staffs.length > 0 ? (
            groups.map((group) => (
              <div className={styles.groupBlock} key={group.label}>
                {showGroupTitles && <h3 className={styles.groupTitle}>{group.label}</h3>}
                <ul className={styles.staffGrid}>
                  {group.items.map((staff) => (
                    <li key={staff.id}>
                      <StaffCard
                        staff={staff}
                        locale={locale}
                        NameTag={showGroupTitles ? "h4" : "h3"}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className={styles.emptyState}>
              {isEn ? "No content has been published yet." : "Chưa có nội dung được đăng tải."}
            </p>
          )}
        </section>

        {faculties.length > 0 && (
          <section
            className={styles.orgSection}
            aria-labelledby="cet-org-faculties-title"
          >
            <h2 className={base.sectionTitle} id="cet-org-faculties-title">
              {facultiesTitle}
            </h2>
            <ul className={styles.orgFacultyGrid}>
              {faculties.map((faculty) => (
                <li key={faculty.slug}>
                  <CetLink
                    className={styles.orgFaculty}
                    href={`/khoa/${faculty.slug}`}
                    locale={locale}
                  >
                    <h3>{faculty.name}</h3>
                    <p>
                      {faculty.programCount > 0 && `${programCountLabel(faculty.programCount, isEn)} · `}
                      {meetStaff}
                    </p>
                  </CetLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasContact && (
          <section className={styles.orgSection}>
            <div className={styles.contactCard}>
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
            </div>
          </section>
        )}
      </div>
    </>
  );
}
