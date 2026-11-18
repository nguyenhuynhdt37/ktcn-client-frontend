import type { FooterBuilder } from "./footer-builder";

export interface FooterLinkItem {
  label_vi: string;
  label_en: string;
  href: string;
  open_in_new_tab: boolean;
}

export interface HomeShortcutItem {
  label_vi: string;
  label_en: string;
  href: string;
  icon: string;
  open_in_new_tab: boolean;
}

export interface SiteSettings {
  footer_builder?: FooterBuilder | null;
  header_logo_width?: number;
  header_logo_height?: number;
  header_logo_object_key?: string | null;
  header_logo_url?: string | null;
  footer_logo_object_key?: string | null;
  footer_logo_url?: string | null;
  fanpage_image_object_key?: string | null;
  fanpage_image_url?: string | null;
  logo_alt_vi: string;
  logo_alt_en: string;
  college_name_vi: string;
  college_name_en: string;
  address_vi: string;
  address_en: string;
  phone: string;
  email: string;
  website: string;
  responsible_officer_vi: string;
  responsible_officer_en: string;
  facebook_url: string;
  messenger_url: string;
  copyright_vi: string;
  copyright_en: string;
  developer_name: string;
  developer_url: string;
  quick_links: FooterLinkItem[];
  external_links: FooterLinkItem[];
  home_shortcuts?: HomeShortcutItem[];
}
