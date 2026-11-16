/* eslint-disable @next/next/no-img-element -- Builder media can come from administrator-supplied URLs without Next image host configuration. */
import type { CSSProperties } from "react";
import type { FooterBlock } from "../types/footer-builder";
import type { SiteSettings } from "../types/setting.types";

export interface FooterNavigationColumn {
  title: string;
  links: { label_vi: string; label_en: string; href: string; open_in_new_tab: boolean }[];
}

export interface FooterDynamicLink {
  label_vi: string;
  label_en: string;
  href: string;
  open_in_new_tab: boolean;
  unit_type?: string;
}

export interface FooterDynamicData {
  departments: FooterDynamicLink[];
  categories: FooterDynamicLink[];
  latest_articles: FooterDynamicLink[];
}

export interface FooterContentProps {
  block: FooterBlock;
  settings: SiteSettings;
  locale: "vi" | "en";
  resolveMedia: (key?: string | null) => string | null;
  defaultLogo: string;
  navigation?: FooterNavigationColumn[];
  dynamicData?: FooterDynamicData;
  localizeHref?: (href: string) => string;
}

function safeFooterHref(value?: string | null) {
  const href = (value || "").trim();
  const scheme = Array.from(href)
    .filter((char) => char.charCodeAt(0) > 32 && char.charCodeAt(0) !== 127)
    .join("")
    .match(/^([a-z][a-z0-9+.-]*):/i)?.[1];
  return !scheme || /^(https?|mailto|tel)$/i.test(scheme) ? href : "#";
}

export function FooterBlockContent({
  block,
  settings,
  locale,
  resolveMedia,
  defaultLogo,
  navigation = [],
  dynamicData,
  localizeHref = (value) => value,
}: FooterContentProps) {
  const en = locale === "en";
  const localized = (vi?: string, english?: string) => (en ? english : vi) || vi || english || "";
  const title = localized(block.title_vi, block.title_en);
  const text = localized(block.text_vi, block.text_en);
  const logo = settings.footer_logo_object_key || settings.header_logo_object_key;
  const media =
    block.image_object_key ||
    (block.type === "logo" ? logo : settings.fanpage_image_object_key || logo);
  const imageSrc = resolveMedia(media) || defaultLogo;
  const alt =
    localized(block.image_alt_vi, block.image_alt_en) ||
    localized(settings.logo_alt_vi, settings.logo_alt_en);
  const href = (value?: string | null) => localizeHref(safeFooterHref(value) || "#");
  const linkProps = (newTab: boolean) => ({
    target: newTab ? "_blank" : undefined,
    rel: newTab ? "noopener noreferrer" : undefined,
  });
  const style: CSSProperties = {
    textAlign: block.align,
    color: block.color || undefined,
    backgroundColor: block.background || undefined,
    fontSize: block.font_size,
    padding: block.padding,
  };
  let content;
  switch (block.type) {
    case "logo":
    case "image": {
      const image = (
        <img
          src={imageSrc}
          alt={alt || title}
          loading="lazy"
          style={{
            width: block.width,
            height: block.height || "auto",
            maxWidth: "100%",
            objectFit: "contain",
            display: "inline-block",
          }}
        />
      );
      content = (
        <>
          {title && <h3 className="fb-title">{title}</h3>}
          {block.href ? (
            <a href={href(block.href)} {...linkProps(block.open_in_new_tab)}>
              {image}
            </a>
          ) : (
            image
          )}
        </>
      );
      break;
    }
    case "heading":
      content = <h3 className="fb-heading">{title}</h3>;
      break;
    case "text":
      content = (
        <>
          {title && <h3 className="fb-title">{title}</h3>}
          <p className="fb-text">{text}</p>
        </>
      );
      break;
    case "button":
      content = (
        <a className="fb-button" href={href(block.href)} {...linkProps(block.open_in_new_tab)}>
          {title || (en ? "Learn more" : "Tìm hiểu thêm")}
        </a>
      );
      break;
    case "divider":
      content = <hr className="fb-divider" />;
      break;
    case "spacer":
      content = <div style={{ height: block.height }} aria-hidden="true" />;
      break;
    case "links": {
      const menu = block.source === "navigation" ? navigation[block.menu_index] : undefined;
      const isDynamic = ["departments", "categories", "latest_articles"].includes(block.source);
      const links =
        menu?.links ||
        (block.source === "quick_links"
          ? settings.quick_links
          : block.source === "external_links"
            ? settings.external_links
            : block.source === "navigation"
              ? block.menu_index === 0
                ? settings.quick_links
                : settings.external_links
              : block.source === "departments"
                ? (dynamicData?.departments || []).filter((item) => item.unit_type === block.unit_type)
                : block.source === "categories"
                  ? dynamicData?.categories
                  : block.source === "latest_articles"
                    ? dynamicData?.latest_articles
                    : block.links);
      content = (
        <>
          {(menu?.title || title) && <h3 className="fb-title">{menu?.title || title}</h3>}
          <ul className="fb-links">
            {(isDynamic ? links?.slice(0, block.item_limit) : links)?.map((link, index) => (
              <li key={index}>
                <a href={href(link.href)} {...linkProps(link.open_in_new_tab)}>
                  {localized(link.label_vi, link.label_en)}
                </a>
              </li>
            ))}
          </ul>
        </>
      );
      break;
    }
    case "contact":
      content = (
        <>
          {title && <h3 className="fb-title">{title}</h3>}
          <p className="fb-title">
            {localized(settings.college_name_vi, settings.college_name_en)}
          </p>
          <address className="fb-contact">
            <p>{localized(settings.address_vi, settings.address_en)}</p>
            {settings.phone && (
              <p>
                <a href={href("tel:" + settings.phone)}>{settings.phone}</a>
              </p>
            )}
            {settings.email && (
              <p>
                <a href={href("mailto:" + settings.email)}>{settings.email}</a>
              </p>
            )}
            {settings.website && (
              <p>
                <a
                  href={href(
                    /^https?:/i.test(settings.website)
                      ? settings.website
                      : "https://" + settings.website,
                  )}
                >
                  {settings.website}
                </a>
              </p>
            )}
            {localized(settings.responsible_officer_vi, settings.responsible_officer_en) && (
              <p>
                {en ? "Responsible officer: " : "Chịu trách nhiệm nội dung: "}
                {localized(settings.responsible_officer_vi, settings.responsible_officer_en)}
              </p>
            )}
          </address>
        </>
      );
      break;
    case "social": {
      const links = block.links.length
        ? block.links
        : [
            {
              label_vi: "Facebook",
              label_en: "Facebook",
              href: settings.facebook_url,
              open_in_new_tab: true,
            },
            {
              label_vi: "Messenger",
              label_en: "Messenger",
              href: settings.messenger_url,
              open_in_new_tab: true,
            },
          ].filter((link) => link.href && link.href !== "#");
      content = (
        <>
          {title && <h3 className="fb-title">{title}</h3>}
          <ul
            className="fb-social"
            style={{
              justifyContent:
                block.align === "center"
                  ? "center"
                  : block.align === "right"
                    ? "flex-end"
                    : "flex-start",
            }}
          >
            {links.map((link, index) => (
              <li key={index}>
                <a href={href(link.href)} {...linkProps(link.open_in_new_tab)}>
                  {localized(link.label_vi, link.label_en)}
                </a>
              </li>
            ))}
          </ul>
        </>
      );
      break;
    }
    case "copyright": {
      const copyright = text || localized(settings.copyright_vi, settings.copyright_en);
      content = (
        <p className="fb-copyright">
          {copyright.replace(/\{year\}/g, String(new Date().getFullYear()))}
          {settings.developer_name && (
            <>
              {" "}
              · {en ? "Developed by " : "Phát triển bởi "}
              <a href={href(settings.developer_url)} {...linkProps(true)}>
                {settings.developer_name}
              </a>
            </>
          )}
        </p>
      );
      break;
    }
  }
  return (
    <div className="fb-content" style={style}>
      {content}
    </div>
  );
}
