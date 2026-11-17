// Pure helpers for CET inner pages. Keep erasable-only TypeScript and no "@/" imports
// so `node --test` can import this file directly.

export type CategoryNode = {
  slug: string;
  name: string;
  /** The categories/tree API omits this field; a node is visible unless it is explicitly false. */
  is_visible?: boolean;
  article_count: number;
  children?: CategoryNode[];
};

export type CategoryPill = { slug: string; name: string };

/** Categories that are not news topics (calendars, department intro pages). */
export const CET_HIDDEN_CATEGORY_SLUGS: string[] = [
  "lich-tuan",
  "weekly-calendar",
  "gioi-thieu",
  "lich-su-phat-trien",
  "chuc-nang-nhiem-vu",
];

function findNode(tree: CategoryNode[], slug: string): CategoryNode | undefined {
  for (const node of tree) {
    if (node.slug === slug) return node;
    const found = node.children ? findNode(node.children, slug) : undefined;
    if (found) return found;
  }
  return undefined;
}

/** Top-level news categories shown as filter pills; the active child category is appended last. */
export function buildCategoryPills(tree: CategoryNode[], activeSlug: string, max = 7): CategoryPill[] {
  const pills = tree
    .filter(
      (node) =>
        node.is_visible !== false &&
        node.article_count > 0 &&
        !CET_HIDDEN_CATEGORY_SLUGS.includes(node.slug),
    )
    .slice(0, max)
    .map((node) => ({ slug: node.slug, name: node.name }));

  if (activeSlug && !pills.some((pill) => pill.slug === activeSlug)) {
    const active = findNode(tree, activeSlug);
    if (active && active.is_visible !== false &&!CET_HIDDEN_CATEGORY_SLUGS.includes(active.slug)) {
      pills.push({ slug: active.slug, name: active.name });
    }
  }
  return pills;
}

/** The "Tất cả" pill is current only when no category and no tag filter narrows the list. */
export function isAllPillActive(filters: { category?: string; tag?: string }): boolean {
  return !filters.category && !filters.tag;
}

/** Pagination window: first, last and the current page with its neighbours; gaps become "…". */
export function pageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 1) return [1];
  const wanted = new Set<number>([1, total]);
  for (let page = current - 1; page <= current + 1; page++) {
    if (page >= 1 && page <= total) wanted.add(page);
  }
  const sorted = [...wanted].sort((a, b) => a - b);
  const result: Array<number | "…"> = [];
  for (let index = 0; index < sorted.length; index++) {
    const page = sorted[index];
    const previous = sorted[index - 1];
    if (previous !== undefined) {
      if (page - previous === 2) result.push(previous + 1);
      else if (page - previous > 2) result.push("…");
    }
    result.push(page);
  }
  return result;
}

/** Bỏ dấu + lowercase để so khớp chức vụ ổn định. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

/** Xếp nhóm: 0 = Hiệu trưởng, 1 = Phó Hiệu trưởng, 2 = khác. */
export function leaderGroup(
  position: string | null | undefined,
  isEn: boolean,
): { order: number; label: string } {
  const p = normalize(position ?? "");
  const isDeputy = /(^|\b)(pho hieu truong|vice rector|vice president|deputy)/.test(p);
  const isHead = !isDeputy && /(hieu truong|rector|president)/.test(p);
  if (isHead) return { order: 0, label: isEn ? "Rector" : "Hiệu trưởng" };
  if (isDeputy) return { order: 1, label: isEn ? "Vice Rectors" : "Phó Hiệu trưởng" };
  return { order: 2, label: isEn ? "Other Leaders" : "Thành viên khác" };
}

export function groupLeaders<T extends { position_name?: string | null }>(
  staffs: T[],
  isEn: boolean,
): Array<{ label: string; items: T[] }> {
  const groups = new Map<number, { label: string; items: T[] }>();
  for (const staff of staffs) {
    const group = leaderGroup(staff.position_name, isEn);
    const bucket = groups.get(group.order) ?? { label: group.label, items: [] };
    bucket.items.push(staff);
    groups.set(group.order, bucket);
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([, value]) => value);
}

/** In-page section navigation for a faculty page; empty sections are omitted. */
export function facultySections(
  counts: { description: boolean; programs: number; articles: number; staffs: number },
  isEn: boolean,
): Array<{ id: string; label: string }> {
  const sections: Array<{ id: string; label: string }> = [];
  if (counts.description) sections.push({ id: "gioi-thieu", label: isEn ? "About" : "Giới thiệu" });
  if (counts.programs > 0) {
    sections.push({
      id: "chuong-trinh-dao-tao",
      label: isEn ? "Programmes" : "Chương trình đào tạo",
    });
  }
  if (counts.articles > 0) sections.push({ id: "tin-tuc", label: isEn ? "News" : "Tin tức" });
  if (counts.staffs > 0) sections.push({ id: "can-bo", label: isEn ? "Staff" : "Cán bộ" });
  return sections;
}

/** Detail page of a programme: master programmes live under postgraduate training. */
export function programHref(program: { slug: string; degree_level?: string | null }): string {
  const section = program.degree_level === "master" ? "sau-dai-hoc" : "dai-hoc";
  return `/dao-tao/${section}/${program.slug}`;
}

/** First letter of the first and last words, e.g. "Hoàng Hữu Việt" -> "HV". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = Array.from(words[0])[0] ?? "";
  if (words.length === 1) return first.toLocaleUpperCase();
  const last = Array.from(words[words.length - 1])[0] ?? "";
  return (first + last).toLocaleUpperCase();
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeEntity(match: string, body: string): string {
  if (body[0] === "#") {
    const isHex = body[1] === "x" || body[1] === "X";
    const code = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
    if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
    return String.fromCodePoint(code);
  }
  return NAMED_ENTITIES[body.toLowerCase()] ?? match;
}

/**
 * Turns CMS HTML into safe single-line plain text: drops script/style, replaces tags with
 * spaces, decodes common entities once and collapses whitespace. The result must be rendered
 * as text (never as HTML).
 */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, decodeEntity)
    .replace(/[\s\u00a0]+/g, " ")
    .trim();
}

/** First CMS HTML candidate that still has visible text (so `<p>&nbsp;</p>` does not win); "" if none. */
export function firstRichText(candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    if (candidate && htmlToPlainText(candidate)) return candidate;
  }
  return "";
}

/**
 * `tel:` href for a free-text phone. Text after the first "(" or an extension marker
 * ("máy lẻ", "ext", "x12") is dropped so extensions do not become part of the number.
 * Returns "" when no digits remain.
 */
export function telHref(raw: string | null | undefined): string {
  if (!raw) return "";
  const main = raw.split(/\(|m[áa]y\s*l[ẻe]|\bext\b|\bx\s*\d/i)[0];
  const number = main.replace(/[^\d+]/g, "");
  return /\d/.test(number) ? `tel:${number}` : "";
}
