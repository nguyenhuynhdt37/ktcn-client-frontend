import type { MenuItemTargetType, MenuItemTreeNode } from "../types/menu.types";

const moduleType = "MODULE" as MenuItemTargetType;
const directorySlug = "gioi-thieu/can-bo";

function isDirectory(item: MenuItemTreeNode) {
  if ([directorySlug, "about/staff"].includes(item.target_info?.slug || "")) return true;
  if (!item.external_url) return false;
  try {
    const path = new URL(item.external_url, "https://local.invalid").pathname
      .replace(/^\/(vi|en)(?=\/)/, "")
      .replace(/\/$/, "");
    return ["/gioi-thieu/can-bo", "/about/staff"].includes(path);
  } catch {
    return false;
  }
}

export function addStaffDirectoryMenu(
  items: MenuItemTreeNode[],
  locale: string,
): MenuItemTreeNode[] {
  const aboutIndex = items.findIndex(
    (item) =>
      ["gioi-thieu", "about"].includes(item.target_info?.slug || "") ||
      ["giới thiệu", "about", "about us"].includes(item.title.trim().toLowerCase()),
  );
  const parent =
    aboutIndex >= 0
      ? items[aboutIndex]
      : {
          id: "builtin-about",
          menu_id: items[0]?.menu_id || "header",
          depth: 0,
          sort_order: items.length,
          is_visible: true,
          has_link: true,
          open_in_new_tab: false,
          title: locale === "en" ? "About" : "Giới thiệu",
          target_type: moduleType,
          target_info: { title: locale === "en" ? "About" : "Giới thiệu", slug: "gioi-thieu" },
          children: [],
        };
  if (parent.children.some(isDirectory)) return items;

  const child: MenuItemTreeNode = {
    id: "builtin-staff-directory",
    menu_id: parent.menu_id,
    parent_id: parent.id,
    title: locale === "en" ? "Staff" : "Cán bộ",
    target_type: moduleType,
    target_info: { title: locale === "en" ? "Staff" : "Cán bộ", slug: directorySlug },
    depth: parent.depth + 1,
    sort_order: parent.children.length,
    is_visible: true,
    has_link: true,
    open_in_new_tab: false,
    children: [],
  };
  const updated = { ...parent, children: [...parent.children, child] };
  return aboutIndex < 0
    ? [...items, updated]
    : items.map((item, index) => (index === aboutIndex ? updated : item));
}
