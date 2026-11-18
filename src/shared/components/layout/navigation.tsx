"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
  type FocusEvent as ReactFocusEvent,
  type ReactNode,
} from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import type { MenuTreeResponse, MenuItemTreeNode } from "@/features/menu/types/menu.types";
import { resolveMenuUrl } from "@/features/menu/utils/resolve-menu-url";
import { addStaffDirectoryMenu } from "@/features/menu/utils/add-staff-directory";
import { getLocalizedField } from "@/features/article/utils/map-article";

type LinkHref = ComponentProps<typeof Link>["href"];

interface NavigationProps {
  initialMenu: MenuTreeResponse | null;
}

function isExternalHref(url: string): boolean {
  return (
    url === "#" ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  );
}

interface NavActionLinkProps {
  url: string;
  openInNewTab: boolean;
  className: string;
  onClick?: () => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLAnchorElement>) => void;
  ariaHasPopup?: "menu" | "true";
  ariaExpanded?: boolean;
  dataAttr?: Record<string, string>;
  children: ReactNode;
}

function NavActionLink({
  url,
  openInNewTab,
  className,
  onClick,
  onKeyDown,
  ariaHasPopup,
  ariaExpanded,
  dataAttr,
  children,
}: NavActionLinkProps) {
  if (isExternalHref(url)) {
    return (
      <a
        href={url}
        target={url !== "#" && openInNewTab ? "_blank" : undefined}
        rel={url !== "#" && openInNewTab ? "noopener noreferrer" : undefined}
        className={className}
        onClick={onClick}
        onKeyDown={onKeyDown}
        aria-haspopup={ariaHasPopup}
        aria-expanded={ariaExpanded}
        {...dataAttr}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={url as LinkHref}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      {...dataAttr}
    >
      {children}
    </Link>
  );
}

export function Navigation({ initialMenu }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [desktopOpenId, setDesktopOpenId] = useState<string | null>(null);
  const [desktopSubOpenId, setDesktopSubOpenId] = useState<string | null>(null);
  const [alignRightId, setAlignRightId] = useState<string | null>(null);
  const [flipSubLeftId, setFlipSubLeftId] = useState<string | null>(null);

  const locale = useLocale();
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset open menus cleanly when client-side navigation updates pathname
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    setActiveDropdown(null);
    setActiveSubDropdown(null);
    setDesktopOpenId(null);
    setDesktopSubOpenId(null);
  }

  const clearDesktopTimers = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (subCloseTimerRef.current) {
      clearTimeout(subCloseTimerRef.current);
      subCloseTimerRef.current = null;
    }
  }, []);

  const closeDesktopMenus = useCallback(() => {
    clearDesktopTimers();
    setDesktopOpenId(null);
    setDesktopSubOpenId(null);
  }, [clearDesktopTimers]);

  useEffect(() => {
    return () => clearDesktopTimers();
  }, [clearDesktopTimers]);

  // Close desktop dropdowns and mobile drawer on outside click or Escape
  useEffect(() => {
    if (!desktopOpenId && !isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (desktopOpenId && desktopNavRef.current && !desktopNavRef.current.contains(target)) {
        closeDesktopMenus();
      }
      if (
        isOpen &&
        mobileDrawerRef.current &&
        !mobileDrawerRef.current.contains(target) &&
        mobileToggleRef.current &&
        !mobileToggleRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const onDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isOpen) {
        setIsOpen(false);
        mobileToggleRef.current?.focus();
      } else if (desktopOpenId) {
        const currentId = desktopOpenId;
        closeDesktopMenus();
        const trigger = desktopNavRef.current?.querySelector<HTMLElement>(
          `[data-nav-trigger="${CSS.escape(currentId)}"]`,
        );
        trigger?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [desktopOpenId, isOpen, closeDesktopMenus]);

  const measureLevel1Alignment = useCallback((id: string, liEl: HTMLElement | null) => {
    if (!liEl || typeof window === "undefined") return;
    const rect = liEl.getBoundingClientRect();
    const estimatedWidth = 300;
    const overflowsRight = rect.left + estimatedWidth > window.innerWidth - 16;
    setAlignRightId(overflowsRight ? id : null);
  }, []);

  const measureLevel2Alignment = useCallback((id: string, subLiEl: HTMLElement | null) => {
    if (!subLiEl || typeof window === "undefined") return;
    const rect = subLiEl.getBoundingClientRect();
    const estimatedWidth = 300;
    const overflowsRight = rect.right + estimatedWidth + 12 > window.innerWidth - 16;
    setFlipSubLeftId(overflowsRight ? id : null);
  }, []);

  const openLevel1 = useCallback(
    (id: string, liEl?: HTMLElement | null) => {
      clearDesktopTimers();
      setDesktopOpenId(id);
      setDesktopSubOpenId(null);
      if (liEl) measureLevel1Alignment(id, liEl);
    },
    [clearDesktopTimers, measureLevel1Alignment],
  );

  const scheduleCloseLevel1 = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setDesktopOpenId(null);
      setDesktopSubOpenId(null);
    }, 120);
  }, []);

  const openLevel2 = useCallback(
    (id: string, subLiEl?: HTMLElement | null) => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (subCloseTimerRef.current) {
        clearTimeout(subCloseTimerRef.current);
        subCloseTimerRef.current = null;
      }
      setDesktopSubOpenId(id);
      if (subLiEl) measureLevel2Alignment(id, subLiEl);
    },
    [measureLevel2Alignment],
  );

  const scheduleCloseLevel2 = useCallback(() => {
    if (subCloseTimerRef.current) clearTimeout(subCloseTimerRef.current);
    subCloseTimerRef.current = setTimeout(() => {
      setDesktopSubOpenId(null);
    }, 120);
  }, []);

  const menuItems: MenuItemTreeNode[] = addStaffDirectoryMenu(initialMenu?.items || [], locale);
  const visibleTopItems = menuItems.filter((item) => item.is_visible);

  const toggleMobileMenu = () => setIsOpen((prev) => !prev);

  const handleDropdownToggle = (id: string) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
    setActiveSubDropdown(null);
  };

  const handleSubDropdownToggle = (id: string) => {
    setActiveSubDropdown((prev) => (prev === id ? null : id));
  };

  const isItemActive = (item: MenuItemTreeNode): boolean => {
    const url = resolveMenuUrl(item, locale);

    if (!url || url === "#") {
      if (item.children && item.children.length > 0) {
        return item.children.some((child) => isItemActive(child));
      }
      return false;
    }

    if (url === "/") {
      return pathname === "/";
    }

    const isActivePath = pathname === url || pathname.startsWith(url + "/");
    if (isActivePath) return true;

    if (item.children && item.children.length > 0) {
      return item.children.some((child) => isItemActive(child));
    }

    return false;
  };

  const focusMenuItem = (container: Element | null | undefined, index: number) => {
    if (!container) return;
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(":scope > li > a, :scope > li > button"),
    );
    if (focusables.length === 0) return;
    const normalized = ((index % focusables.length) + focusables.length) % focusables.length;
    focusables[normalized]?.focus();
  };

  const handleDesktopNavBlur = (event: ReactFocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !desktopNavRef.current?.contains(nextTarget)) {
      closeDesktopMenus();
    }
  };

  const handleDesktopTopKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
    item: MenuItemTreeNode,
    hasSubmenu: boolean,
  ) => {
    const liEl = event.currentTarget.closest("li");
    if (event.key === "ArrowDown" && hasSubmenu) {
      event.preventDefault();
      openLevel1(item.id, liEl);
      requestAnimationFrame(() => {
        const list = liEl?.querySelector<HTMLElement>(":scope > ul");
        focusMenuItem(list, 0);
      });
    } else if (event.key === "Escape" && desktopOpenId) {
      event.preventDefault();
      event.stopPropagation();
      closeDesktopMenus();
    }
  };

  const handleDesktopSubKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
    parentItem: MenuItemTreeNode,
    subItem: MenuItemTreeNode,
    subIndex: number,
    hasSubmenuLevel2: boolean,
    isFlippedLeft: boolean,
  ) => {
    const currentLi = event.currentTarget.closest("li");
    const level1List = currentLi?.parentElement;
    const openSubKey = isFlippedLeft ? "ArrowLeft" : "ArrowRight";

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusMenuItem(level1List, subIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusMenuItem(level1List, subIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusMenuItem(level1List, 0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusMenuItem(level1List, -1);
    } else if (event.key === openSubKey && hasSubmenuLevel2) {
      event.preventDefault();
      openLevel2(subItem.id, currentLi);
      requestAnimationFrame(() => {
        const level2List = currentLi?.querySelector<HTMLElement>(":scope > ul");
        focusMenuItem(level2List, 0);
      });
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeDesktopMenus();
      const trigger = desktopNavRef.current?.querySelector<HTMLElement>(
        `[data-nav-trigger="${CSS.escape(parentItem.id)}"]`,
      );
      trigger?.focus();
    }
  };

  const handleDesktopLevel2KeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
    subItemId: string,
    nestedIndex: number,
    isFlippedLeft: boolean,
  ) => {
    const currentLi = event.currentTarget.closest("li");
    const level2List = currentLi?.parentElement;
    const closeSubKey = isFlippedLeft ? "ArrowRight" : "ArrowLeft";

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusMenuItem(level2List, nestedIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusMenuItem(level2List, nestedIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusMenuItem(level2List, 0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusMenuItem(level2List, -1);
    } else if (event.key === closeSubKey || event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setDesktopSubOpenId(null);
      const subTrigger = desktopNavRef.current?.querySelector<HTMLElement>(
        `[data-nav-sub-trigger="${CSS.escape(subItemId)}"]`,
      );
      subTrigger?.focus();
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        ref={desktopNavRef}
        onBlur={handleDesktopNavBlur}
        className="hidden items-center lg:flex"
        aria-label={locale === "en" ? "Main navigation" : "Điều hướng chính"}
      >
        <ul className="flex items-center gap-0.5 xl:gap-1.5">
          {visibleTopItems.map((item) => {
            const visibleChildren = (item.children || []).filter((sub) => sub.is_visible);
            const hasSubmenu = visibleChildren.length > 0;
            const targetUrl = resolveMenuUrl(item, locale);
            const title = getLocalizedField<string>(item, "title", locale);
            const isActive = isItemActive(item);
            const isLevel1Open = desktopOpenId === item.id;
            const isRightAligned = alignRightId === item.id;

            const navLinkClass = `hover:bg-slate-50/80 hover:text-brand-darkred flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[13px] font-semibold transition-colors duration-150 xl:px-3 xl:text-sm relative ${
              isActive || isLevel1Open
                ? "text-brand-darkred font-bold"
                : "text-slate-700"
            }`;

            return (
              <li
                key={item.id}
                className="relative shrink-0"
                onMouseEnter={(event) => {
                  if (hasSubmenu) {
                    openLevel1(item.id, event.currentTarget);
                  } else {
                    closeDesktopMenus();
                  }
                }}
                onMouseLeave={() => {
                  if (hasSubmenu) scheduleCloseLevel1();
                }}
              >
                {hasSubmenu ? (
                  item.has_link ? (
                    <NavActionLink
                      url={targetUrl}
                      openInNewTab={item.open_in_new_tab}
                      className={navLinkClass}
                      ariaHasPopup="menu"
                      ariaExpanded={isLevel1Open}
                      dataAttr={{ "data-nav-trigger": item.id }}
                      onClick={closeDesktopMenus}
                      onKeyDown={(event) => handleDesktopTopKeyDown(event, item, true)}
                    >
                      {title}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-150 ${
                          isLevel1Open ? "text-brand-darkred rotate-180" : "text-slate-500"
                        }`}
                        aria-hidden="true"
                      />
                    </NavActionLink>
                  ) : (
                    <button
                      type="button"
                      data-nav-trigger={item.id}
                      aria-haspopup="menu"
                      aria-expanded={isLevel1Open}
                      onClick={(event) => {
                        const liEl = event.currentTarget.closest("li");
                        if (isLevel1Open) {
                          closeDesktopMenus();
                        } else {
                          openLevel1(item.id, liEl);
                        }
                      }}
                      onKeyDown={(event) => handleDesktopTopKeyDown(event, item, true)}
                      className={navLinkClass}
                    >
                      {title}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-150 ${
                          isLevel1Open ? "text-brand-darkred rotate-180" : "text-slate-500"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  )
                ) : (
                  <NavActionLink
                    url={targetUrl}
                    openInNewTab={item.open_in_new_tab}
                    className={navLinkClass}
                    onClick={closeDesktopMenus}
                  >
                    {title}
                  </NavActionLink>
                )}

                {/* Submenu cấp 1 */}
                {hasSubmenu && isLevel1Open && (
                  <ul
                    className={`border-neutral-200 animate-slide-down absolute top-full z-50 w-max min-w-64 max-w-[min(24rem,calc(100vw-2rem))] rounded-lg border bg-white p-1.5 shadow-lg ${
                      isRightAligned ? "right-0" : "left-0"
                    }`}
                  >
                    {visibleChildren.map((subItem, subIndex) => {
                      const visibleNested = (subItem.children || []).filter(
                        (nested) => nested.is_visible,
                      );
                      const hasSubmenuLevel2 = visibleNested.length > 0;
                      const subTargetUrl = resolveMenuUrl(subItem, locale);
                      const subTitle = getLocalizedField<string>(subItem, "title", locale);
                      const isSubActive = isItemActive(subItem);
                      const isLevel2Open = desktopSubOpenId === subItem.id;
                      const isFlippedLeft = flipSubLeftId === subItem.id;

                      const subLinkClass = `hover:bg-slate-50 hover:text-brand-darkred flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150 ${
                        isSubActive || isLevel2Open
                          ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold"
                          : "text-slate-700 font-medium"
                      }`;

                      return (
                        <li
                          key={subItem.id}
                          className="relative px-1 py-0.5"
                          onMouseEnter={(event) => {
                            if (hasSubmenuLevel2) {
                              openLevel2(subItem.id, event.currentTarget);
                            } else {
                              if (subCloseTimerRef.current) clearTimeout(subCloseTimerRef.current);
                              setDesktopSubOpenId(null);
                            }
                          }}
                          onMouseLeave={() => {
                            if (hasSubmenuLevel2) scheduleCloseLevel2();
                          }}
                        >
                          {hasSubmenuLevel2 ? (
                            subItem.has_link ? (
                              <NavActionLink
                                url={subTargetUrl}
                                openInNewTab={subItem.open_in_new_tab}
                                className={subLinkClass}
                                ariaHasPopup="menu"
                                ariaExpanded={isLevel2Open}
                                dataAttr={{ "data-nav-sub-trigger": subItem.id }}
                                onClick={closeDesktopMenus}
                                onKeyDown={(event) =>
                                  handleDesktopSubKeyDown(
                                    event,
                                    item,
                                    subItem,
                                    subIndex,
                                    true,
                                    isFlippedLeft,
                                  )
                                }
                              >
                                <span>{subTitle}</span>
                                <ChevronRight
                                  size={14}
                                  className={`shrink-0 transition-transform duration-150 ${
                                    isLevel2Open
                                      ? "text-brand-darkred translate-x-0.5"
                                      : "text-slate-500"
                                  }`}
                                  aria-hidden="true"
                                />
                              </NavActionLink>
                            ) : (
                              <button
                                type="button"
                                data-nav-sub-trigger={subItem.id}
                                aria-haspopup="menu"
                                aria-expanded={isLevel2Open}
                                onClick={(event) => {
                                  const subLiEl = event.currentTarget.closest("li");
                                  if (isLevel2Open) {
                                    setDesktopSubOpenId(null);
                                  } else {
                                    openLevel2(subItem.id, subLiEl);
                                  }
                                }}
                                onKeyDown={(event) =>
                                  handleDesktopSubKeyDown(
                                    event,
                                    item,
                                    subItem,
                                    subIndex,
                                    true,
                                    isFlippedLeft,
                                  )
                                }
                                className={subLinkClass}
                              >
                                <span>{subTitle}</span>
                                <ChevronRight
                                  size={14}
                                  className={`shrink-0 transition-transform duration-150 ${
                                    isLevel2Open
                                      ? "text-brand-darkred translate-x-0.5"
                                      : "text-slate-500"
                                  }`}
                                  aria-hidden="true"
                                />
                              </button>
                            )
                          ) : (
                            <NavActionLink
                              url={subTargetUrl}
                              openInNewTab={subItem.open_in_new_tab}
                              className={subLinkClass}
                              onClick={closeDesktopMenus}
                              onKeyDown={(event) =>
                                handleDesktopSubKeyDown(
                                  event,
                                  item,
                                  subItem,
                                  subIndex,
                                  false,
                                  isFlippedLeft,
                                )
                              }
                            >
                              <span>{subTitle}</span>
                            </NavActionLink>
                          )}

                          {/* Submenu cấp 2 (nested dropdown) */}
                          {hasSubmenuLevel2 && isLevel2Open && (
                            <ul
                              className={`border-neutral-200 animate-fade-in absolute top-0 z-50 w-max min-w-64 max-w-[min(24rem,calc(100vw-2rem))] rounded-lg border bg-white p-1.5 shadow-lg before:absolute before:top-0 before:h-full before:w-2.5 before:content-[''] ${
                                isFlippedLeft
                                  ? "right-full mr-1.5 before:-right-2.5"
                                  : "left-full ml-1.5 before:-left-2.5"
                              }`}
                            >
                              {visibleNested.map((nestedItem, nestedIndex) => {
                                const nestedTargetUrl = resolveMenuUrl(nestedItem, locale);
                                const nestedTitle = getLocalizedField<string>(
                                  nestedItem,
                                  "title",
                                  locale,
                                );
                                const isNestedActive = isItemActive(nestedItem);

                                const nestedLinkClass = `hover:bg-slate-50 hover:text-brand-darkred flex min-h-11 items-center rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                                  isNestedActive
                                    ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold"
                                    : "text-slate-700 font-medium"
                                }`;

                                return (
                                  <li key={nestedItem.id} className="px-1 py-0.5">
                                    <NavActionLink
                                      url={nestedTargetUrl}
                                      openInNewTab={nestedItem.open_in_new_tab}
                                      className={nestedLinkClass}
                                      onClick={closeDesktopMenus}
                                      onKeyDown={(event) =>
                                        handleDesktopLevel2KeyDown(
                                          event,
                                          subItem.id,
                                          nestedIndex,
                                          isFlippedLeft,
                                        )
                                      }
                                    >
                                      <span>{nestedTitle}</span>
                                    </NavActionLink>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile Toggle Button */}
      <button
        ref={mobileToggleRef}
        type="button"
        onClick={toggleMobileMenu}
        className="hover:bg-surface hover:text-brand-darkred inline-flex size-11 items-center justify-center rounded-lg text-slate-700 transition-colors duration-150 lg:hidden"
        aria-label={
          locale === "en"
            ? isOpen
              ? "Close navigation menu"
              : "Open navigation menu"
            : isOpen
              ? "Đóng menu điều hướng"
              : "Mở menu điều hướng"
        }
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div
          ref={mobileDrawerRef}
          id="mobile-navigation"
          className="border-border animate-fade-in absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t bg-white shadow-[var(--shadow-lg)] lg:hidden"
        >
          <div className="site-container space-y-4 py-5">
            <div className="border-border border-b pb-3">
              <span className="text-sm font-semibold text-slate-700">
                {locale === "en"
                  ? "COLLEGE OF ENGINEERING & TECHNOLOGY MENU"
                  : "MENU TRƯỜNG KỸ THUẬT VÀ CÔNG NGHỆ"}
              </span>
            </div>
            <ul className="space-y-1">
              {visibleTopItems.map((item) => {
                const visibleChildren = (item.children || []).filter((sub) => sub.is_visible);
                const hasSubmenu = visibleChildren.length > 0;
                const targetUrl = resolveMenuUrl(item, locale);
                const title = getLocalizedField<string>(item, "title", locale);
                const isActive = isItemActive(item);
                const isMobileExpanded = activeDropdown === item.id;

                const mobileLinkClass = `hover:bg-surface hover:text-brand-darkred flex min-h-11 items-center rounded-lg px-3 text-base transition-colors duration-150 w-full text-left ${
                  isActive
                    ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold"
                    : "text-slate-700 font-semibold"
                }`;

                return (
                  <li key={item.id} className="space-y-0.5">
                    {hasSubmenu ? (
                      <div>
                        <div className="hover:bg-surface flex w-full items-center justify-between rounded-lg">
                          {item.has_link ? (
                            <NavActionLink
                              url={targetUrl}
                              openInNewTab={item.open_in_new_tab}
                              onClick={() => setIsOpen(false)}
                              className={mobileLinkClass}
                            >
                              {title}
                            </NavActionLink>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDropdownToggle(item.id)}
                              aria-expanded={isMobileExpanded}
                              className="min-h-11 flex-grow px-3 text-left text-base font-semibold text-slate-700 transition-colors duration-150"
                            >
                              {title}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDropdownToggle(item.id)}
                            className="hover:text-brand-darkred inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors duration-150 hover:bg-white"
                            aria-label={`${
                              isMobileExpanded
                                ? locale === "en"
                                  ? "Collapse"
                                  : "Thu gọn"
                                : locale === "en"
                                  ? "Expand"
                                  : "Mở rộng"
                            } ${title}`}
                            aria-expanded={isMobileExpanded}
                          >
                            <ChevronDown
                              size={14}
                              aria-hidden="true"
                              className={`transition-transform duration-200 ${
                                isMobileExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>
                        {isMobileExpanded && (
                          <ul className="bg-surface animate-fade-up mt-1 ml-3 space-y-1 rounded-lg p-2">
                            {visibleChildren.map((subItem) => {
                              const visibleNested = (subItem.children || []).filter(
                                (nested) => nested.is_visible,
                              );
                              const hasSubmenuLevel2 = visibleNested.length > 0;
                              const subTargetUrl = resolveMenuUrl(subItem, locale);
                              const subTitle = getLocalizedField<string>(
                                subItem,
                                "title",
                                locale,
                              );
                              const isSubActive = isItemActive(subItem);
                              const isSubExpanded = activeSubDropdown === subItem.id;

                              const mobileSubClass = `hover:text-brand-darkred flex min-h-11 items-center rounded-md px-2 text-sm transition-colors duration-150 hover:bg-white w-full ${
                                isSubActive
                                  ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold"
                                  : "text-slate-700 font-semibold"
                              }`;

                              return (
                                <li key={subItem.id} className="space-y-0.5">
                                  {hasSubmenuLevel2 ? (
                                    <div>
                                      <div className="flex items-center justify-between gap-1">
                                        {subItem.has_link ? (
                                          <NavActionLink
                                            url={subTargetUrl}
                                            openInNewTab={subItem.open_in_new_tab}
                                            onClick={() => setIsOpen(false)}
                                            className={mobileSubClass}
                                          >
                                            {subTitle}
                                          </NavActionLink>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleSubDropdownToggle(subItem.id)}
                                            aria-expanded={isSubExpanded}
                                            className="flex min-h-11 flex-1 items-center px-2 text-left text-sm font-semibold text-slate-700"
                                          >
                                            {subTitle}
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleSubDropdownToggle(subItem.id)}
                                          className="hover:text-brand-darkred inline-flex size-10 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-white"
                                          aria-label={`${
                                            isSubExpanded
                                              ? locale === "en"
                                                ? "Collapse"
                                                : "Thu gọn"
                                              : locale === "en"
                                                ? "Expand"
                                                : "Mở rộng"
                                          } ${subTitle}`}
                                          aria-expanded={isSubExpanded}
                                        >
                                          <ChevronDown
                                            size={14}
                                            aria-hidden="true"
                                            className={`transition-transform duration-200 ${
                                              isSubExpanded ? "rotate-180" : ""
                                            }`}
                                          />
                                        </button>
                                      </div>
                                      {isSubExpanded && (
                                        <ul className="space-y-0.5 pl-3">
                                          {visibleNested.map((nestedItem) => {
                                            const nestedTargetUrl = resolveMenuUrl(
                                              nestedItem,
                                              locale,
                                            );
                                            const nestedTitle = getLocalizedField<string>(
                                              nestedItem,
                                              "title",
                                              locale,
                                            );
                                            const isNestedActive = isItemActive(nestedItem);

                                            return (
                                              <li key={nestedItem.id}>
                                                <NavActionLink
                                                  url={nestedTargetUrl}
                                                  openInNewTab={nestedItem.open_in_new_tab}
                                                  onClick={() => setIsOpen(false)}
                                                  className={`hover:text-brand-darkred flex min-h-11 items-center rounded-md px-2 text-sm transition-colors duration-150 hover:bg-white ${
                                                    isNestedActive
                                                      ? "text-brand-darkred bg-brand-darkred/[0.04] font-bold"
                                                      : "text-slate-600"
                                                  }`}
                                                >
                                                  {nestedTitle}
                                                </NavActionLink>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      )}
                                    </div>
                                  ) : (
                                    <NavActionLink
                                      url={subTargetUrl}
                                      openInNewTab={subItem.open_in_new_tab}
                                      onClick={() => setIsOpen(false)}
                                      className={mobileSubClass}
                                    >
                                      {subTitle}
                                    </NavActionLink>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <NavActionLink
                        url={targetUrl}
                        openInNewTab={item.open_in_new_tab}
                        onClick={() => setIsOpen(false)}
                        className={mobileLinkClass}
                      >
                        {title}
                      </NavActionLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
