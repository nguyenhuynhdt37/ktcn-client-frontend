export type FooterBlockType =
  | "logo"
  | "heading"
  | "text"
  | "links"
  | "contact"
  | "social"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "copyright";

export interface FooterBlock {
  id: string;
  type: FooterBlockType;
  title_vi: string;
  title_en: string;
  text_vi: string;
  text_en: string;
  href: string;
  open_in_new_tab: boolean;
  image_object_key: string | null;
  image_alt_vi: string;
  image_alt_en: string;
  source:
    | "custom"
    | "quick_links"
    | "external_links"
    | "navigation"
    | "departments"
    | "categories"
    | "latest_articles";
  unit_type: "faculty" | "department" | "office" | "center" | "lab";
  item_limit: number;
  menu_index: number;
  links: { label_vi: string; label_en: string; href: string; open_in_new_tab: boolean }[];
  align: "left" | "center" | "right";
  color: string | null;
  background: string | null;
  font_size: number;
  padding: number;
  width: number;
  height: number;
  hidden_desktop: boolean;
  hidden_mobile: boolean;
}

export interface FooterColumn {
  id: string;
  width: number;
  blocks: FooterBlock[];
}

export interface FooterRow {
  id: string;
  columns: FooterColumn[];
  background: string | null;
  color: string | null;
  padding: number;
  gap: number;
}

export interface FooterBuilder {
  version: 1;
  enabled: boolean;
  background: string;
  color: string;
  link_color: string;
  max_width: number;
  gap: number;
  show_statistics: boolean;
  rows: FooterRow[];
}
