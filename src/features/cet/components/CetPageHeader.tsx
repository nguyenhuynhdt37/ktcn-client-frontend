import Image from "next/image";
import { CetLink } from "./CetLink";
import base from "../cet.module.css";
import styles from "../cet-inner.module.css";

export type CetCrumb = { label: string; href?: string };

/**
 * Title band shared by CET inner pages. `hideTitle` omits the h1 for pages
 * (e.g. articles) that render their own h1 in the content area.
 */
export function CetPageHeader({
  title,
  crumbs,
  locale,
  hideTitle = false,
}: {
  title: string;
  crumbs: CetCrumb[];
  locale: string;
  hideTitle?: boolean;
}) {
  const isEn = locale === "en";
  const items: CetCrumb[] = [{ label: isEn ? "Home" : "Trang chủ", href: "/" }, ...crumbs];

  return (
    <div className={styles.pageBand}>
      <Image
        className={styles.watermark}
        src="/images/cet-emblem.png"
        width={640}
        height={640}
        alt=""
        aria-hidden="true"
      />
      <div className={`${base.container} ${styles.bandInner}`}>
        <nav aria-label={isEn ? "Breadcrumb" : "Đường dẫn"}>
          <ol className={styles.crumbs}>
            {items.map((crumb, index) => {
              const isLast = index === items.length - 1;
              return (
                <li key={`${index}-${crumb.label}`}>
                  {crumb.href && !isLast ? (
                    <CetLink href={crumb.href} locale={locale}>
                      {crumb.label}
                    </CetLink>
                  ) : (
                    <span aria-current={isLast ? "page" : undefined}>{crumb.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        {!hideTitle && <h1 className={styles.pageTitle}>{title}</h1>}
      </div>
    </div>
  );
}
