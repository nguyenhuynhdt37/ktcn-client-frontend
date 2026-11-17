import { MapPin, Phone, Mail, Globe, ChevronRight, Facebook } from "lucide-react";
import type { SiteSettings } from "@/features/setting/types/setting.types";
import type { PortalDepartment } from "@/features/department/types/department.types";
import { CetLink } from "./CetLink";
import styles from "../cet.module.css";

export function CetFooter({
  settings,
  departments,
  locale,
}: {
  settings: SiteSettings | null;
  departments: PortalDepartment[];
  locale: string;
}) {
  const isEn = locale === "en";
  const name =
    (isEn ? settings?.college_name_en : settings?.college_name_vi) ||
    (isEn ? "College of Engineering and Technology" : "Trường Kỹ thuật và Công nghệ");
  const address = isEn ? settings?.address_en : settings?.address_vi;
  const links = [...(settings?.quick_links ?? []), ...(settings?.external_links ?? [])];
  return (
    <footer className={styles.footer} id="lien-he">
      <div className={`${styles.container} ${styles.footerGrid}`}>
        <div>
          <h2>{name}</h2>
          <ul className={styles.contactList}>
            {address && (
              <li>
                <MapPin size={17} aria-hidden="true" />
                <span>{address}</span>
              </li>
            )}
            {settings?.phone && (
              <li>
                <Phone size={17} aria-hidden="true" />
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>{settings.phone}</a>
              </li>
            )}
            {settings?.email && (
              <li>
                <Mail size={17} aria-hidden="true" />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            )}
            {settings?.website && (
              <li>
                <Globe size={17} aria-hidden="true" />
                <CetLink
                  href={
                    /^https?:\/\//.test(settings.website)
                      ? settings.website
                      : `https://${settings.website}`
                  }
                  locale={locale}
                >
                  {settings.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </CetLink>
              </li>
            )}
            {settings?.facebook_url && (
              <li>
                <Facebook size={17} aria-hidden="true" />
                <CetLink href={settings.facebook_url} locale={locale} target="_blank">
                  {isEn ? "College Facebook" : "Facebook của Trường"}
                </CetLink>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2>{isEn ? "Organisation" : "Cơ cấu tổ chức"}</h2>
          <ul className={styles.footerLinks}>
            {departments.map((item) => (
              <li key={item.id}>
                <ChevronRight size={13} aria-hidden="true" />
                <CetLink href={`/khoa/${item.slug}`} locale={locale}>
                  {item.name}
                </CetLink>
              </li>
            ))}
            {!departments.length && (
              <li>
                <CetLink href="/gioi-thieu/cac-khoa-dao-tao" locale={locale}>
                  {isEn ? "Faculties" : "Các khoa đào tạo"}
                </CetLink>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2>{isEn ? "Useful links" : "Liên kết"}</h2>
          <ul className={styles.footerLinks}>
            <li>
              <ChevronRight size={13} aria-hidden="true" />
              <a href="https://vinhuni.edu.vn/" target="_blank" rel="noopener noreferrer">
                {isEn ? "Vinh University" : "Trường Đại học Vinh"}
              </a>
            </li>
            {links.map((link, index) => (
              <li key={`${link.href}-${index}`}>
                <ChevronRight size={13} aria-hidden="true" />
                <CetLink
                  href={link.href}
                  locale={locale}
                  target={link.open_in_new_tab ? "_blank" : undefined}
                >
                  {isEn ? link.label_en || link.label_vi : link.label_vi}
                </CetLink>
              </li>
            ))}
            {!links.length && (
              <li>
                <CetLink href="/tu-van-tuyen-sinh" locale={locale}>
                  {isEn ? "Admissions consultation" : "Tư vấn tuyển sinh"}
                </CetLink>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>
        {(
          (isEn ? settings?.copyright_en : settings?.copyright_vi) || `© {year} ${name}.`
        ).replaceAll("{year}", String(new Date().getFullYear()))}
      </div>
    </footer>
  );
}
