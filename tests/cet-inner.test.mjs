import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCategoryPills,
  pageNumbers,
  groupLeaders,
  facultySections,
  initials,
  htmlToPlainText,
  programHref,
  CET_HIDDEN_CATEGORY_SLUGS,
  telHref,
  firstRichText,
  isAllPillActive,
} from "../src/features/cet/utils/inner.ts";

const node = (slug, extra = {}) => ({
  slug,
  name: `Name ${slug}`,
  is_visible: true,
  article_count: 3,
  ...extra,
});

test("buildCategoryPills drops hidden, empty and reserved categories, keeps order and caps", () => {
  const tree = [
    node("a"),
    node("b", { is_visible: false }),
    node("c", { article_count: 0 }),
    ...CET_HIDDEN_CATEGORY_SLUGS.map((s) => node(s)),
    node("d"),
    node("e"),
  ];
  assert.deepEqual(
    buildCategoryPills(tree, "", 2).map((p) => p.slug),
    ["a", "d"],
  );
  assert.deepEqual(
    buildCategoryPills(tree, "").map((p) => p.slug),
    ["a", "d", "e"],
  );
  assert.deepEqual(buildCategoryPills(tree, "a")[0], { slug: "a", name: "Name a" });
});

test("buildCategoryPills appends the active child category as the last pill", () => {
  const tree = [node("a", { children: [node("child-slug")] }), node("b")];
  const pills = buildCategoryPills(tree, "child-slug");
  assert.deepEqual(
    pills.map((p) => p.slug),
    ["a", "b", "child-slug"],
  );
  assert.deepEqual(pills.at(-1), { slug: "child-slug", name: "Name child-slug" });
});

const bare = (slug, extra = {}) => ({ slug, name: `Name ${slug}`, article_count: 3, ...extra });

test("buildCategoryPills keeps nodes that have no is_visible field (real API omits it)", () => {
  const tree = [bare("announcements", { children: [] }), bare("events")];
  assert.deepEqual(
    buildCategoryPills(tree, "").map((p) => p.slug),
    ["announcements", "events"],
  );
});

test("buildCategoryPills drops only is_visible === false and still drops hidden slugs / empty counts", () => {
  const tree = [
    bare("a"),
    bare("b", { is_visible: false }),
    bare("c", { article_count: 0 }),
    bare("lich-tuan"),
    bare("d", { is_visible: true }),
  ];
  assert.deepEqual(
    buildCategoryPills(tree, "").map((p) => p.slug),
    ["a", "d"],
  );
});

test("buildCategoryPills appends an active child without is_visible, but not an explicitly hidden one", () => {
  const tree = [bare("a", { children: [bare("kid"), bare("secret", { is_visible: false })] })];
  assert.deepEqual(
    buildCategoryPills(tree, "kid").map((p) => p.slug),
    ["a", "kid"],
  );
  assert.deepEqual(
    buildCategoryPills(tree, "secret").map((p) => p.slug),
    ["a"],
  );
});

test("pageNumbers collapses long ranges with ellipses", () => {
  assert.deepEqual(pageNumbers(1, 1), [1]);
  assert.deepEqual(pageNumbers(5, 10), [1, "…", 4, 5, 6, "…", 10]);
  assert.deepEqual(pageNumbers(2, 4), [1, 2, 3, 4]);
});

test("groupLeaders orders rector, deputies, others with localized labels", () => {
  const staffs = [
    { id: 1, position_name: "Giảng viên" },
    { id: 2, position_name: "Phó Hiệu trưởng, phụ trách Trường" },
    { id: 3, position_name: "Hiệu trưởng" },
    { id: 4, position_name: "Vice Rector" },
  ];
  const vi = groupLeaders(staffs, false);
  assert.deepEqual(
    vi.map((g) => g.label),
    ["Hiệu trưởng", "Phó Hiệu trưởng", "Thành viên khác"],
  );
  assert.deepEqual(vi[0].items.map((s) => s.id), [3]);
  assert.deepEqual(vi[1].items.map((s) => s.id), [2, 4]);
  assert.deepEqual(vi[2].items.map((s) => s.id), [1]);
  assert.deepEqual(
    groupLeaders(staffs, true).map((g) => g.label),
    ["Rector", "Vice Rectors", "Other Leaders"],
  );
});

test("facultySections lists only non-empty sections", () => {
  assert.deepEqual(
    facultySections({ description: true, programs: 0, articles: 3, staffs: 8 }, false).map((s) => s.id),
    ["gioi-thieu", "tin-tuc", "can-bo"],
  );
  assert.deepEqual(
    facultySections({ description: true, programs: 0, articles: 3, staffs: 8 }, false).map((s) => s.label),
    ["Giới thiệu", "Tin tức", "Cán bộ"],
  );
  assert.deepEqual(facultySections({ description: false, programs: 0, articles: 0, staffs: 0 }, false), []);
});

test("initials takes first and last word initials", () => {
  assert.equal(initials("Hoàng Hữu Việt"), "HV");
  assert.equal(initials(""), "");
});

test("htmlToPlainText strips tags, decodes entities and collapses whitespace", () => {
  assert.equal(htmlToPlainText("<p>- Phụ trách&nbsp;công tác</p>\n<p>  Đào   tạo &amp; NCKH </p>"), "- Phụ trách công tác Đào tạo & NCKH");
  assert.equal(htmlToPlainText("<p>a</p><p>b</p>"), "a b");
  assert.equal(htmlToPlainText("a<br/>b<br>c"), "a b c");
  assert.equal(htmlToPlainText("&lt;script&gt;x&lt;/script&gt; &#65;&#x42; &quot;q&quot; &#39;s&#39;"), "<script>x</script> AB \"q\" 's'");
  assert.equal(htmlToPlainText("<script>alert(1)</script><style>p{}</style>ok"), "ok");
  assert.equal(htmlToPlainText(null), "");
  assert.equal(htmlToPlainText(undefined), "");
  assert.equal(htmlToPlainText("<p>&nbsp;</p>"), "");
});

test("programHref routes master programmes to postgraduate, everything else to undergraduate", () => {
  assert.equal(programHref({ slug: "cong-nghe-thong-tin", degree_level: "bachelor" }), "/dao-tao/dai-hoc/cong-nghe-thong-tin");
  assert.equal(programHref({ slug: "khoa-hoc-may-tinh", degree_level: "master" }), "/dao-tao/sau-dai-hoc/khoa-hoc-may-tinh");
  assert.equal(programHref({ slug: "x", degree_level: "" }), "/dao-tao/dai-hoc/x");
});

test("telHref cuts extensions and notes before keeping digits and a leading plus", () => {
  assert.equal(telHref("0238 3855452"), "tel:02383855452");
  assert.equal(telHref("0238 3855452 (máy lẻ 12)"), "tel:02383855452");
  assert.equal(telHref("0238.3855.452 máy lẻ 12"), "tel:02383855452");
  assert.equal(telHref("0238 3855452 ext. 12"), "tel:02383855452");
  assert.equal(telHref("0238 3855452 x12"), "tel:02383855452");
  assert.equal(telHref("+84 238 3855 452"), "tel:+842383855452");
  assert.equal(telHref("(máy lẻ 12)"), "");
  assert.equal(telHref("liên hệ văn phòng"), "");
  assert.equal(telHref(""), "");
});

test("firstRichText returns the first candidate whose plain text is non-empty", () => {
  assert.equal(firstRichText(["<p>&nbsp;</p>", "short text"]), "short text");
  assert.equal(firstRichText(["<p>long</p>", "short"]), "<p>long</p>");
  assert.equal(firstRichText([null, undefined, "", "  <br> ", "ok"]), "ok");
  assert.equal(firstRichText(["<p>&nbsp;</p>", null]), "");
  assert.equal(firstRichText([]), "");
});

test("isAllPillActive is true only when neither category nor tag filter is set", () => {
  assert.equal(isAllPillActive({}), true);
  assert.equal(isAllPillActive({ q: "abc" }), true);
  assert.equal(isAllPillActive({ category: "tin" }), false);
  assert.equal(isAllPillActive({ tag: "hoc-bong" }), false);
  assert.equal(isAllPillActive({ category: "", tag: "" }), true);
});
