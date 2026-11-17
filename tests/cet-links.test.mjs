import assert from "node:assert/strict";
import { test } from "node:test";
import { safePortalHref, languageSwitchTarget } from "../src/features/cet/utils/links.ts";

test("CET links preserve public routes, query strings, contacts and HTTPS destinations", () => {
  for (const href of [
    "/tin-tuc?category_slug=thong-bao",
    "/khoa/cong-nghe-thong-tin",
    "#lien-he",
    "https://vinhuni.edu.vn",
    "mailto:cet@vinhuni.edu.vn",
    "tel:02383855452",
  ]) {
    assert.equal(safePortalHref(href), href);
  }
});

test("CET links reject script protocols, protocol-relative URLs and disguised destinations", () => {
  for (const href of [
    "javascript:alert(1)",
    "data:text/html,hi",
    "//evil.example",
    "/\\evil.example",
    "java\nscript:alert(1)",
    "ftp://evil.example",
    "invalid",
    null,
    "",
  ]) {
    assert.equal(safePortalHref(href), "#");
  }
});

test("language switching returns to a relevant list instead of reusing a translated slug", () => {
  assert.deepEqual(languageSwitchTarget("/tin-tuc/[slug]", {}, true), {
    pathname: "/tin-tuc",
    query: {},
  });
  assert.deepEqual(languageSwitchTarget("/khoa/[slug]", {}, true), {
    pathname: "/gioi-thieu/cac-khoa-dao-tao",
    query: {},
  });
  assert.deepEqual(languageSwitchTarget("/dao-tao/dai-hoc/[slug]", {}, true), {
    pathname: "/dao-tao/dai-hoc",
    query: {},
  });
  assert.deepEqual(languageSwitchTarget("/lich-tuan/[slug]", {}, true), {
    pathname: "/lich-tuan",
    query: {},
  });
  assert.deepEqual(
    languageSwitchTarget(
      "/tin-tuc",
      { q: "robot", category_slug: "tin-tuc-va-su-kien", page: "3" },
      false,
    ),
    { pathname: "/tin-tuc", query: { q: "robot" } },
  );
  assert.deepEqual(languageSwitchTarget("/gioi-thieu", {}, false), {
    pathname: "/gioi-thieu",
    query: {},
  });
});
