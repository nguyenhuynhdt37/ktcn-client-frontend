import type { CSSProperties } from "react";
import type { SiteSettings } from "../types/setting.types";
import {
  FooterBlockContent,
  type FooterDynamicData,
  type FooterNavigationColumn,
} from "./FooterContent";
import { resolveSettingMediaUrl } from "../services/settingService";
import defaultLogo from "@/shared/assets/logo-640.webp";
import "./footer-content.css";

export function FooterLayout({
  settings,
  locale,
  navigation,
  dynamicData,
}: {
  settings: SiteSettings;
  locale: "vi" | "en";
  navigation: FooterNavigationColumn[];
  dynamicData?: FooterDynamicData;
}) {
  const layout = settings.footer_builder!;
  const localizeHref = (href: string) =>
    href.startsWith("/") && !href.startsWith("//") && !/^\/(vi|en)(\/|$)/.test(href)
      ? `/${locale}${href}`
      : href;
  return (
    <div
      style={
        {
          backgroundColor: layout.background,
          color: layout.color,
          "--fb-link-color": layout.link_color,
        } as CSSProperties
      }
    >
      {layout.rows.map((row) => (
        <div
          key={row.id}
          style={{ backgroundColor: row.background || undefined, color: row.color || undefined }}
        >
          <div
            className="fb-layout-row"
            style={
              {
                maxWidth: layout.max_width,
                margin: "0 auto",
                padding: row.padding,
                "--fb-columns": row.columns
                  .map((column) => `minmax(0, ${column.width}fr)`)
                  .join(" "),
                "--fb-row-gap": `${row.gap}px`,
                "--fb-tablet-columns": `repeat(${Math.min(2, row.columns.length)}, minmax(0, 1fr))`,
                "--fb-block-gap": `${layout.gap}px`,
              } as CSSProperties
            }
          >
            {row.columns.map((column) => (
              <div key={column.id} className="fb-layout-column">
                {column.blocks.map((block) => (
                  <div
                    key={block.id}
                    className={`${block.hidden_desktop ? "fb-hide-desktop" : ""} ${block.hidden_mobile ? "fb-hide-mobile" : ""}`}
                  >
                    <FooterBlockContent
                      block={block}
                      settings={settings}
                      locale={locale}
                      navigation={navigation}
                      dynamicData={dynamicData}
                      resolveMedia={resolveSettingMediaUrl}
                      defaultLogo={defaultLogo.src}
                      localizeHref={localizeHref}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
