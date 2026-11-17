"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams, useParams } from "next/navigation";
import { Home, Search, Phone, Mail, Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import type {
  PortalMenuTreeResponse,
  PortalMenuItemTreeNode,
} from "@/features/menu/types/menu.types";
import type { SiteSettings } from "@/features/setting/types/setting.types";
import { resolveMenuUrl } from "@/features/menu/utils/resolve-menu-url";
import { CetLink } from "./CetLink";
import { languageSwitchTarget } from "../utils/links";
import styles from "../cet.module.css";

function MenuEntry({ item, locale }: { item: PortalMenuItemTreeNode; locale: string }) {
  const children = item.children?.filter((child) => child.is_visible) ?? [];
  const href = resolveMenuUrl(item, locale);
  const details = useRef<HTMLDetailsElement>(null);
  if (!children.length)
    return href === "#" ? (
      <span className={styles.navLabel}>{item.title}</span>
    ) : (
      <CetLink
        className={styles.navLink}
        href={href}
        locale={locale}
        target={item.open_in_new_tab ? "_blank" : undefined}
      >
        {item.title}
      </CetLink>
    );
  return (
    <details
      ref={details}
      className={styles.dropdown}
      onKeyDown={(event) => {
        if (event.key === "Escape" && details.current) {
          details.current.open = false;
          details.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary>
        {item.title}
        <ChevronDown size={14} aria-hidden="true" />
      </summary>
      <ul className={styles.submenu}>
        {href !== "#" && (
          <li>
            <CetLink href={href} locale={locale}>
              {locale === "en" ? "Overview" : "Tổng quan"}
            </CetLink>
          </li>
        )}
        {children.map((child) => (
          <li key={child.id}>
            <MenuEntry item={child} locale={locale} />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function CetHeader({
  menu,
  settings,
  locale,
}: {
  menu: PortalMenuTreeResponse | null;
  settings: SiteSettings | null;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const isEn = locale === "en";
  const name = (
    (isEn ? settings?.college_name_en : settings?.college_name_vi) ||
    (isEn ? "COLLEGE OF ENGINEERING AND TECHNOLOGY" : "TRƯỜNG KỸ THUẬT VÀ CÔNG NGHỆ")
  ).replace(/\s*[-–,]\s*(Trường Đại học Vinh|Vinh University)$/i, "");
  const items = menu?.items.filter((item) => item.is_visible) ?? [];
  // Each dropdown is a native <details>, which never closes by itself. Keep one branch open at a
  // time and close everything on an outside click or after following a link (the header lives in
  // the layout, so it survives client-side navigation).
  useEffect(() => {
    const root = nav.current;
    if (!root) return;
    const closeAll = (keep?: Element) => {
      root.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((details) => {
        if (!keep || !details.contains(keep)) details.open = false;
      });
    };
    const onToggle = (event: Event) => {
      const details = event.target as HTMLDetailsElement;
      if (details.open) closeAll(details);
    };
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("a")) closeAll();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!root.contains(event.target as Node)) closeAll();
    };
    root.addEventListener("toggle", onToggle, true);
    root.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      root.removeEventListener("toggle", onToggle, true);
      root.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("search") ?? "").trim();
    router.push({ pathname: "/tin-tuc", query: value ? { q: value } : {} });
    setOpen(false);
  }
  function switchLanguage(next: "vi" | "en") {
    if (next === locale) return;
    router.replace(
      languageSwitchTarget(
        pathname,
        Object.fromEntries(searchParams),
        Boolean(params.slug),
      ) as Parameters<typeof router.replace>[0],
      { locale: next },
    );
  }
  const searchForm = (
    <form className={styles.search} role="search" onSubmit={search}>
      <input
        name="search"
        type="search"
        placeholder={isEn ? "Search news, announcements…" : "Tìm kiếm tin tức, thông báo…"}
        aria-label={isEn ? "Search news" : "Tìm kiếm tin tức"}
      />
      <button type="submit" aria-label={isEn ? "Search" : "Tìm kiếm"}>
        <Search size={19} />
      </button>
    </form>
  );
  return (
    <>
      <header id="cet-top">
        <a className={styles.skipLink} href="#cet-main">
          {isEn ? "Skip to content" : "Đến nội dung chính"}
        </a>
        <div className={styles.topbar}>
          <div className={styles.container}>
            <div className={styles.contacts}>
              {settings?.phone && (
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>
                  <Phone size={13} aria-hidden="true" />
                  {settings.phone}
                </a>
              )}
              {settings?.email && (
                <a className={styles.topEmail} href={`mailto:${settings.email}`}>
                  <Mail size={13} aria-hidden="true" />
                  {settings.email}
                </a>
              )}
            </div>
            <div className={styles.topLinks}>
              <a href="https://vinhuni.edu.vn/" target="_blank" rel="noopener noreferrer">
                {isEn ? "Vinh University" : "Trường Đại học Vinh"}
              </a>
              <a
                className={styles.topEmail}
                href="https://outlook.office.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {isEn ? "Webmail" : "Thư điện tử"}
              </a>
              <div
                className={styles.languages}
                role="group"
                aria-label={isEn ? "Language" : "Ngôn ngữ"}
              >
                <button
                  type="button"
                  aria-label="Tiếng Việt"
                  aria-pressed={!isEn}
                  onClick={() => switchLanguage("vi")}
                >
                  <span className={styles.flagVi} aria-hidden="true">
                    ★
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="English"
                  aria-pressed={isEn}
                  onClick={() => switchLanguage("en")}
                >
                  <span aria-hidden="true">🇬🇧</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.brandbar}>
          <div className={styles.container}>
            <CetLink className={styles.brand} href="/" locale={locale}>
              <Image
                src="/images/cet-emblem.png"
                width={84}
                height={84}
                alt={isEn ? "College emblem" : "Biểu trưng Trường Kỹ thuật và Công nghệ"}
                priority
              />
              <div>
                <div className={styles.university}>
                  {isEn ? "- VINH UNIVERSITY -" : "- TRƯỜNG ĐẠI HỌC VINH -"}
                </div>
                <div className={styles.college}>{name}</div>
              </div>
            </CetLink>
            <div className={styles.desktopSearch}>{searchForm}</div>
          </div>
        </div>
      </header>
      <nav
        ref={nav}
        className={styles.mainnav}
        aria-label={isEn ? "Main navigation" : "Điều hướng chính"}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <div className={styles.container}>
          <div className={styles.mobileNav}>
            <CetLink href="/" locale={locale}>
              <Home size={18} aria-hidden="true" />
              {isEn ? "Home" : "Trang chủ"}
            </CetLink>
            <button
              type="button"
              aria-label={isEn ? "Toggle menu" : "Mở menu"}
              aria-expanded={open}
              aria-controls="cet-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div
            id="cet-navigation"
            className={`${styles.navigation} ${open ? styles.navigationOpen : ""}`}
          >
            <ul
              className={styles.menuList}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              <li className={styles.homeNav}>
                <CetLink
                  className={styles.navLink}
                  href="/"
                  locale={locale}
                  aria-label={isEn ? "Home" : "Trang chủ"}
                >
                  <Home size={18} />
                </CetLink>
              </li>
              {items.map((item) => (
                <li key={item.id}>
                  <MenuEntry item={item} locale={locale} />
                </li>
              ))}
              {!items.length && (
                <li>
                  <CetLink className={styles.navLink} href="/tin-tuc" locale={locale}>
                    {isEn ? "News" : "Tin tức"}
                  </CetLink>
                </li>
              )}
              <li>
                <a className={styles.navLink} href="#lien-he">
                  {isEn ? "Contact" : "Liên hệ"}
                </a>
              </li>
            </ul>
            <div className={styles.mobileSearch}>{searchForm}</div>
          </div>
        </div>
      </nav>
    </>
  );
}
