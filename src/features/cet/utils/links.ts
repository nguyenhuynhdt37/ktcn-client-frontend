/** Only allow navigation protocols supported by the public portal. */
export function safePortalHref(value?: string | null, fallback = "#"): string {
  const href = (value ?? "").trim();
  if (!href || /[\u0000-\u001f\u007f\\]/.test(href)) return fallback;
  if (href.startsWith("#")) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol) ? href : fallback;
  } catch {
    return fallback;
  }
}

/** Slugs are translated by the API; use the matching listing in the new language. */
export function languageSwitchTarget(
  pathname: string,
  query: Record<string, string>,
  hasSlug: boolean,
) {
  const detailParents: Record<string, string> = {
    "/tin-tuc/[slug]": "/tin-tuc",
    "/khoa/[slug]": "/gioi-thieu/cac-khoa-dao-tao",
    "/bo-mon/[slug]": "/gioi-thieu/cac-khoa-dao-tao",
    "/nhan-su/[slug]": "/gioi-thieu/can-bo",
    "/dao-tao/dai-hoc/[slug]": "/dao-tao/dai-hoc",
    "/dao-tao/sau-dai-hoc/[slug]": "/dao-tao/sau-dai-hoc",
    "/lich-tuan/[slug]": "/lich-tuan",
    "/tai-lieu/[slug]": "/tai-lieu/van-ban-bieu-mau",
  };
  if (hasSlug) return { pathname: detailParents[pathname] ?? "/tin-tuc", query: {} };
  if (pathname === "/tin-tuc") return { pathname, query: query.q ? { q: query.q } : {} };
  return { pathname, query };
}
